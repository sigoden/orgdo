import * as yargs from "yargs";

export default class Client {
  constructor() {}

  list(options: ListOptions) {
    console.log(options);
  }

  add(options: AddOptions) {
    console.log(options);
  }

  update(options: UpdateOptions) {
    console.log(options);
  }
  cancel(options: IdOptions) {
    console.log(options);
  }

  done(options: IdOptions) {
    console.log(options);
  }

  start(options: IdOptions) {
    console.log(options);
  }
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
