import * as yargs from "yargs";

import Client from "./Client";
import Task, { TaskPriority, TaskStatus } from "./Task";
import * as taskFilters from "./task-filters";

export default class Cli {
  private client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  public async list(options: ListOptions) {
    const filters: taskFilters.TaskFilter[] = [];
    if (options.tags) {
      filters.push(task => {
        if (task.tags.length === 0) {
          return false;
        }
        return taskFilters.newTagsFilter(options.tags)(task.tags);
      });
    }
    if (options.priority) {
      filters.push(task => task.priority === options.priority);
    }
    if (options.status) {
      filters.push(task => task.status === options.status);
    }
    ["start", "started", "complete", "completed"].map(key => {
      if (options[key]) {
        filters.push(task => {
          if (!task[key]) {
            return /ed$/.test(key) ? false : true;
          }
          return taskFilters.newTimerFilter(options[key])(task[key]);
        });
      }
    });
    if (options.name) {
      filters.push(task =>
        taskFilters.newRegexpFilter(options.name)(task.name)
      );
    }
    const filter = taskFilters.combine(filters);
    const tasks = await this.client.listTasks(filter);
    return tasks;
  }

  public async add(options: AddOptions) {
    const { tags, describe, priority, start, complete, name } = options;
    const id = await this.client.incId("taskId");
    const task = Task.fromRaw({
      id,
      tags,
      describe,
      priority,
      start,
      complete,
      name
    });
    await this.client.addTask(task);
    return task;
  }

  public async update(options: UpdateOptions) {
    const task = await this.client.getTask(options.id);
    task.update(options);
    if (options["add-tags"]) {
      task.addTags(options["add-tags"]);
    }
    if (options["remove-tags"]) {
      task.removeTags(options["remove-tags"]);
    }
    await this.client.updateTask(task);
    return task;
  }

  public async cancel(options: IdOptions) {
    const task = await this.client.getTask(options.id);
    task.updateStatus("cancel");
    task.completed = new Date();
    await this.client.updateTask(task);
    return task;
  }

  public async done(options: IdOptions) {
    const task = await this.client.getTask(options.id);
    task.updateStatus("done");
    task.completed = new Date();
    await this.client.updateTask(task);
    return task;
  }

  public async get(options: IdOptions) {
    const task = await this.client.getTask(options.id);
    return task;
  }

  public async start(options: IdOptions) {
    const task = await this.client.getTask(options.id);
    task.updateStatus("doing");
    task.started = new Date();
    await this.client.updateTask(task);
    return task;
  }

  public async remove(options: IdOptions) {
    await this.client.removeTask(options.id);
  }
}

export interface ListOptions {
  tags?: string[];
  priority?: TaskPriority;
  status?: TaskStatus;
  name?: string;
  start?: string;
  started?: string;
  complete?: string;
  completed?: string;
  "with-statistic"?: string;
  "only-statistic"?: string;
}

export interface AddOptions {
  tags?: string[];
  describe?: string;
  priority?: TaskPriority;
  start?: string;
  complete?: string;
  name: string;
}

export interface IdOptions {
  id: number;
}

export interface UpdateOptions {
  id: number;
  "add-tags"?: string[];
  "remove-tags"?: string[];
  describe?: string;
  priority?: TaskPriority;
  start?: string;
  complete?: string;
  name?: string;
}
