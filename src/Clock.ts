import * as yargs from "yargs";

import Client from "./Client";

export default class Clock {
  constructor(client: Client) {}

  public start() {}
  public break() {}
  public status() {}
  public set() {}
  public list() {}
}

export interface SetOptions extends yargs.Arguments {
  "long-break-time"?: number;
  "short-break-time"?: number;
  "long-break-count"?: number;
  "short-break-count"?: number;
  notify?: boolean;
}
