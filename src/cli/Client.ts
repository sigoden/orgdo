import * as yargs from "yargs";

export default class Client {
  constructor() {}

  public list(options: ListOptions) {}

  public add(options: AddOptions) {}

  public update(options: UpdateOptions) {}
  public cancel(options: IdOptions) {}

  public done(options: IdOptions) {}

  public start(options: IdOptions) {}
}

export interface ListOptions extends yargs.Arguments {
  tags?: string[];
  priority?: "high" | "medium" | "low";
  status?: "todo" | "doing" | "done" | "cancel";
  name?: string;
  start?: string;
  rstart?: string;
  end?: string;
  rend?: string;
  "with-statistic"?: string;
  "only-statistic"?: string;
}

export interface AddOptions extends yargs.Arguments {
  tags?: string[];
  describe?: string;
  priority?: "high" | "medium" | "low";
  start?: number;
  end?: number;
  name: string;
}

export interface IdOptions extends yargs.Arguments {
  id: number;
}

export interface UpdateOptions extends yargs.Arguments {
  tags?: string[];
  describe?: string;
  priority?: "high" | "medium" | "low";
  start?: number;
  end?: number;
  name?: string;
}
