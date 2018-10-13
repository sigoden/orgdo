import * as _ from "lodash";
import * as timestring from "timestring";
import * as os from "os";

export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "doing" | "done" | "cancel";

const RE_TIME = /^\d{2,4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/;

export default class Task {
  public static load(model: Model) {
    const task = new Task(model.id, model.name);
    task.tags = model.tags ? formatTags(model.tags) : [];
    task.update(model);
    return task;
  }
  public static sort(t1: Task, t2: Task) {
    const p1 = priorityToInt(t1.priority);
    const p2 = priorityToInt(t2.priority);
    if (p1 === p2) {
      return t1.id - t2.id;
    } else {
      return p2 - p1;
    }
  }
  public static fromJSON(data: any) {
    ["start", "started", "complete", "completed"].forEach(key => {
      if (data[key]) {
        data[key] = new Date(data[key]);
      }
    });
    const task: Task = Object.assign(new Task(data.id, data.name), data);
    return task;
  }
  public id: number;
  public name: string;
  public tags: string[];
  public priority: TaskPriority;
  public status: TaskStatus;
  public describe?: string;
  public start?: Date;
  public started?: Date;
  public complete?: Date;
  public completed?: Date;
  constructor(id: number, name: string) {
    this.id = id;
    this.name = _.trim(_.replace(name, os.EOL, " "));
    this.status = "todo";
    this.priority = "medium";
  }
  public addTags(tags: string[]): this {
    const normalizedTags = formatTags(tags);
    this.tags = _.union(this.tags, normalizedTags);
    return this;
  }
  public removeTags(tags: string[]): this {
    const normalizedTags = formatTags(tags);
    _.remove(this.tags, v => normalizedTags.indexOf(v) !== -1);
    return this;
  }
  public update(data: UpdateData): this {
    if (data.describe) {
      this.describe = data.describe;
    }
    if (data.priority) {
      this.priority = data.priority;
    }
    if (data.start) {
      this.start = parseTimestr(data.start);
    }
    if (data.complete) {
      this.complete = parseTimestr(data.complete);
    }
    return this;
  }

  public updateStatus(status: TaskStatus) {
    if (this.status === "done" || this.status === "cancel") {
      throw new Error("Cannot update finished task");
    }
    this.status = status;
  }
}

function formatTags(tags: string[]) {
  return _.flatMap(tags.map(tag => tag.split(",")));
}

function parseTimestr(timestr: string): Date {
  timestr = _.trim(timestr);
  const createErr = () => new Error("Invalid timestr");
  let date;
  if (RE_TIME.test(timestr)) {
    if (/^\d{2}-/.test(timestr)) {
      timestr = "20" + timestr;
    }
    date = new Date(timestr);
    if (!/\d{2}:\d{2}(:\d{2})?$/.test(timestr)) {
      date.setHours(0);
    }
    if (isNaN(<any> date)) {
      throw createErr();
    }
    return date;
  }
  const time = timestring(timestr, "ms");
  if (time === 0) {
    throw createErr();
  }
  return new Date(Date.now() + time);
}

function priorityToInt(priority: TaskPriority): number {
  switch (priority) {
    case "high":
      return 1;
    case "low":
      return -1;
    default:
      return 0;
  }
}

interface Model extends UpdateData {
  tags?: string[];
  id: number;
  name: string;
}

interface UpdateData {
  describe?: string;
  priority?: TaskPriority;
  start?: string;
  complete?: string;
}
