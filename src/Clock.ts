import Client from "./Client";

export default class Clock {
  private client: Client;
  constructor(client: Client) {
    this.client = client;
  }
  public async start(id?: number) {
    if (id) {
      await this.client.getTask(id);
    }
    const state = await this.client.getClockState();
    if (state.type === "running") {
      throw new Error(
        `Clock is running and will break in ${secondToTimeString(state.time)}`
      );
    }
    const args = await this.getClockStartArtgs(id);
    await this.client.startClock(args);
  }
  public async stop() {
    const state = await this.client.getClockState();
    if (state.type === "idle") {
      return;
    }
    await this.client.stopClock();
  }
  public async status() {
    const state = await this.client.getClockState();
    const clocks = await this.client.listClocks(todayFilter);
    return { state, index: clocks.length };
  }
  public async update(options: UpdateOptions) {
    await this.client.updateClockSettings(options);
    return this.client.getClockSettings();
  }
  public async list(options: ListOptions) {
    if (!options.after && !options.before) {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      options.after = date.toString();
    }
    const afterFilter = newDateFilter(options.after, "after", v => v > 0);
    let filter: ClockFilter;
    if (options.before) {
      filter = (clock: ClockModel) => {
        return (
          afterFilter(clock) &&
          newDateFilter(options.before, "before", v => v < 0)(clock)
        );
      };
    } else {
      filter = afterFilter;
    }
    return this.client.listClocks(filter);
  }
  private async getClockStartArtgs(id?: number) {
    const clocks = await this.client.listClocks(todayFilter);
    const settings = await this.client.getClockSettings();
    const isLong =
      clocks.length === 0 ||
      (clocks.length + 1) % settings["long-break-count"] === 0;
    const args: StartClockArgs = isLong
      ? {
          workTime: settings["work-time"],
          next: "short",
          breakTime: settings["short-break-time"]
        }
      : {
          workTime: settings["work-time"],
          next: "long",
          breakTime: settings["long-break-time"]
        };
    if (id) {
      args.taskId = id;
    }
    return args;
  }
}

export interface ListOptions {
  before?: string;
  after?: string;
}

export function secondToTimeString(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds}`;
}

export interface ClockSettings {
  "long-break-time": number;
  "short-break-time": number;
  "long-break-count": number;
  "work-time": number;
}

export interface ClockState {
  type: "idle" | "running" | "shortbreaking" | "longbreaking";
  time?: number;
}

export type ClockFilter = (clock: ClockModel) => boolean;

function todayFilter(clock: ClockModel) {
  const date = new Date();
  date.setHours(4);
  return clock.createdAt.getTime() - date.getTime() > 0;
}

function newDateFilter(
  datestr: string,
  field: string,
  compare: (v: number) => boolean
) {
  const date = new Date(datestr);
  if (isNaN(<any> date)) {
    throw new Error(`Invalid ${field} datestr`);
  }
  return (clock: ClockModel) => {
    return compare(clock.createdAt.getTime() - date.getTime());
  };
}

export interface ClockModel {
  id: number;
  time: number;
  taskId?: number;
  createdAt: Date;
}

export function newClockModel(data: any) {
  data.createdAt = new Date(data.createdAt);
  return <ClockModel> data;
}

export type UpdateOptions = Partial<ClockSettings>;

export interface StartClockArgs {
  taskId?: number;
  workTime: number;
  next: "short" | "long";
  breakTime: number;
}
