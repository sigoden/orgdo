import Client from "./Client";

export default class Clock {
  private client: Client;
  constructor(client: Client) {
    this.client = client;
    this.client.on("clock.break", data => {
      this.onBreak(data);
    });
  }
  public async start(id?: number) {
    if (id) {
      await this.client.getTask(id);
    }
    await this.client.startClock({ data: { id }, type: "start" });
  }
  public async stop() {
    await this.client.stopClock();
  }
  public async status() {
    const ret: { state: ClockState } = await this.client.getClockState(
      "clock.status"
    );
    const config = await this.client.getClockConfig();
    return { config, state: ret.state };
  }
  public async update(options: UpdateOptions) {
    await this.client.updateClockConfig(options);
  }
  public async list(options: ListOptions) {}
  private async onBreak(data: any) {}
}

export interface UpdateOptions {
  "long-break-time"?: number;
  "short-break-time"?: number;
  "long-break-count"?: number;
}

type ClockState = "idle" | "running" | "shortbreaking" | "longbreaking";

type Aggregate = "month" | "week" | "day";

export interface ListOptions {
  aggregates?: Aggregate;
  before?: "string";
  after?: "string";
}
