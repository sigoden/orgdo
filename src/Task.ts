import * as _ from "lodash";
import * as timestring from "timestring";
import * as os from "os";

interface RawData extends UpdateData {
  tags?: string[];
  id: number;
  name: string;
}

interface UpdateData {
  describe?: string;
  priority?: TaskPriority;
  start?: string;
  end?: string;
}

export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "doing" | "done" | "cancel";

const RE_TIME = /^\d{2,4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/;

export default class Task {
  public static fromRaw(raw: RawData) {
    const task = new Task(raw.id, raw.name);
    task.tags = raw.tags ? formatTags(raw.tags) : [];
    task.update(raw);
    return task;
  }
  public static sort(t1: Task, t2: Task) {
    const p1 = priorityToInt(t1.priority);
    const p2 = priorityToInt(t2.priority);
    if (p1 === p2) {
      return t1.id - t2.id;
    } else {
      return p1 - p2;
    }
  }
  public static fromJSON(data: any) {
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
  public rstart?: Date;
  public end?: Date;
  public rend?: Date;
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
    if (data.end) {
      this.end = parseTimestr(data.end);
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
    if (/^\d{2}/.test(timestr)) {
      timestr = "20" + timestr;
    }
    date = new Date(timestr);
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