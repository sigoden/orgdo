import * as low from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";
import * as _ from "lodash";
import * as os from "os";
import * as mkdirp from "mkdirp";

import { DATA_DIR, DATA_FILE, DEFAULT_DB } from "./constants";

mkdirp.sync(DATA_DIR);

export interface Options {
  dataFile: string;
}

import Task from "./Task";
import { TaskFilter } from "./task-filters";
import IPC from "./IPC";
import {
  ClockSettings,
  ClockState,
  ClockFilter,
  StartClockArgs,
  newClockModel,
  ClockModel
} from "./Clock";
import { CronModel } from "./CronJob";

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
  private ipc: IPC;

  constructor(options: Options) {
    this.ipc = new IPC(options.dataFile);
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
    return this.ipc.exec("clock.start", args);
  }

  public async stopClock() {
    if (!this.ipc.isRunning()) {
      return;
    }
    return this.ipc.exec("clock.stop");
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
    const data = await this.ipc.exec("clock.state");
    return <ClockState> data;
  }

  public async listClocks(filter: ClockFilter) {
    const clocks = await this.db.get("clocks").value();
    return <ClockModel[]> (
      clocks.map(clock => newClockModel(clock)).filter(clock => filter(clock))
    );
  }

  public async addClock(data: any) {
    const id = await this.incId("clockId");
    await this.db
      .get("clocks")
      .push({ id, createdAt: new Date(), ...data })
      .write();
  }

  public async addCron(data: CronModel) {
    await this.db
      .get("crons")
      .push(data)
      .write();
    await this.ipc.exec("cron.add", data);
  }

  public async getCron(id: number) {
    const data = this.db
      .get("crons")
      .find(cron => cron.id === id)
      .value();
    if (!data) {
      throw new Error(`Cron ${id} not found`);
    }
    return <CronModel> data;
  }

  public async updateCron(cron: CronModel) {
    await this.db
      .get("crons")
      .find({ id: cron.id })
      .assign(cron)
      .write();
    await this.ipc.exec("cron.update", cron);
  }

  public async removeCron(id: number) {
    try {
      await this.getCron(id);
    } catch (err) {
      return;
    }
    await this.db
      .get("crons")
      .remove({ id })
      .write();
    await this.ipc.exec("cron.remove", { id });
  }

  public async listCrons() {
    const crons = await this.db.get("crons").value();
    return <CronModel[]> crons;
  }
}

export function print(str: string, eol = true) {
  process.stdout.write(str);
  if (eol) {
    process.stdout.write(os.EOL);
  }
}

export function printErrorAndExit(err: any, exitCode = 1) {
  if (err instanceof Error) {
    print(err.message);
  } else {
    print(err.toString());
  }
  process.exit(1);
}
