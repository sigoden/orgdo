import * as low from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";
import * as _ from "lodash";
import * as os from "os";
import * as mkdirp from "mkdirp";
import * as ipc from "./ipc";
import getPath from "platform-folders";
import * as path from "path";

const DEFAULT_DB = {
  tasks: [],
  taskId: 0,
  clocks: [],
  clockId: 0,
  crons: [],
  cronId: 0,
  ipcPid: 0,
  clockSettings: {
    "work-time": "25",
    "long-break-time": "30",
    "short-break-time": "10",
    "long-break-count": "4"
  }
};

export const DATA_DIR = path.resolve(getPath("userData"), "orgdo");
export const DATA_FILE = path.resolve(DATA_DIR, ".orgdo.json");
mkdirp.sync(DATA_DIR);

export interface Options {
  dataFile: string;
}

import Task from "./Task";
import { TaskFilter } from "./task-filters";
import Clock, {
  ClockSettings,
  ClockState,
  ClockFilter,
  StartClockArgs,
  newClockModel
} from "./Clock";

export default class Client {
  public static async init(options: Options = { dataFile: DATA_FILE }) {
    const client = new Client(options);
    try {
      client.db = await low(new FileAsync(options.dataFile));
      await client.db.defaults(_.cloneDeep(DEFAULT_DB)).write();
    } catch (err) {
      print(err.message);
    }
    return client;
  }

  public db: low.LowdbAsync<any>;
  private options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  public async incId(name: string) {
    const id = this.db.get("taskId").value() + 1;
    await this.db.set("taskId", id).write();
    return <number> id;
  }

  public async listTasks(filter: TaskFilter) {
    const tasks = await this.db.get("tasks").value();
    return <Task[]> tasks
      .map(task => Task.fromJSON(task))
      .filter(task => filter(task))
      .sort(Task.sort);
  }

  public async addTask(task: Task) {
    await this.db
      .get("tasks")
      .push(task)
      .write();
  }

  public async updateTask(task: Task) {
    await this.db
      .get("tasks")
      .find({ id: task.id })
      .assign(task)
      .write();
  }

  public async getTask(id: number) {
    const data = this.db
      .get("tasks")
      .find(task => task.id === id)
      .value();
    if (!data) {
      throw new Error(`Task ${id} not found`);
    }
    return Task.fromJSON(data);
  }

  public async removeTask(id: number) {
    await this.db
      .get("tasks")
      .remove({ id })
      .write();
  }

  public async startClock(args: StartClockArgs) {
    return ipc.call("clock.start", args);
  }

  public async stopClock() {
    if (!this.isIPCServerRunning()) {
      return;
    }
    return ipc.call("clock.stop");
  }

  public async getClockSettings() {
    return <ClockSettings> this.db.get("clockSettings").value();
  }

  public async updateClockSettings(settings: any) {
    await this.db
      .get("clockSettings")
      .assign(settings)
      .write();
  }

  public async getClockState() {
    await this.runIPCServer();
    const data = await ipc.call("clock.state");
    return <ClockState> data;
  }

  public async listClocks(filter: ClockFilter) {
    const clocks = await this.db.get("clocks").value();
    return <Clock[]> (
      clocks.map(clock => newClockModel(clock)).filter(clock => filter(clock))
    );
  }

  public async addClock(data: any) {
    const id = await this.incId("clockId");
    await this.db
      .get("tasks")
      .push({ id, createdAt: new Date(), ...data })
      .write();
  }

  public async clearIpcPid() {
    await this.db.set("ipcPid", 0).write();
  }

  private async isIPCServerRunning() {
    const pid = this.db.get("ipcPid").value();
    return pid && ipc.isServerRunning(pid);
  }

  private async runIPCServer() {
    const isRunning = await this.isIPCServerRunning();
    if (!isRunning) {
      const cp = await ipc.runServer(this.options.dataFile);
      await this.db.set("ipcPid", cp.pid).write();
    }
  }
}

export function print(str: string, eol = true) {
  process.stdout.write(str);
  if (eol) {
    process.stdout.write(os.EOL);
  }
}
