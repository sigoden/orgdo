import * as low from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";
import * as _ from "lodash";
import * as os from "os";

const DEFAULT_DB = {
  tasks: [],
  taskId: 0,
  clocks: [],
  clockId: 0,
  crons: [],
  cronId: 0,
  clockSettings: {
    "long-break-time": "30",
    "short-break-time": "10",
    "long-break-count": "4",
    "notify": true
  }
};

export interface Options {
  store: string;
}

import Task from "./Task";
import { TaskFilter } from "./task-filters";

export default class Client {
  public static async init(options: Options = { store: ".orgdo.json" }) {
    const client = new Client();
    try {
      client.db = await low(new FileAsync(options.store));
      await client.db.defaults(DEFAULT_DB).write();
    } catch (err) {
      print(err.message);
    }
    return client;
  }

  private db: low.LowdbAsync<any>;

  public async incId(name: string) {
    const id = this.db.get("taskId").value() + 1;
    await this.db.set("taskId", id).write();
    return <number> id;
  }

  public async listTasks(filter: TaskFilter) {
    const tasks = await this.db.get("tasks").value();
    return tasks
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
}

export function print(str: string, eol = false) {
  process.stdout.write(str);
  if (eol) {
    process.stdout.write(os.EOL);
  }
}
