import Client from "./Client";
import { CronTime } from "cron";

export default class Cron {
  private client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  public async add(options: AddOptions) {
    verifyCron(options.cron);
    const id = await this.client.incId("taskId");
    options.task = options.task || `Task ${id}`;
    const model: CronModel = {
      id,
      cron: options.cron,
      task: options.task
    };
    await this.client.addCron(model);
    return model;
  }
  public async update(options: UpdateOptions) {
    const model = await this.client.getCron(options.id);
    if (options.cron) {
      verifyCron(options.cron);
      model.cron = options.cron;
    }
    if (options.task) {
      model.task = options.task;
    }
    await this.client.updateCron(model);
    return model;
  }
  public async remove(id: number) {
    await this.client.removeCron(id);
  }
  public async list() {
    return this.client.listCrons();
  }
}

export interface AddOptions {
  task?: string;
  cron: string;
}

export interface UpdateOptions {
  id: number;
  task?: string;
  cron?: string;
}

export interface CronModel {
  id: number;
  cron: string;
  task: string;
}

function verifyCron(cron: string) {
  try {
    const _ = new CronTime(cron);
  } catch (err) {
    throw new Error(`Invalid cron pattern ${cron}, ${err.message}`);
  }
}
