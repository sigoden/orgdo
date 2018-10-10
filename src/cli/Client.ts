import * as low from "lowdb";
import * as FileSync from "lowdb/adapters/FileSync";

const DEFAULT_DB = {
  tasks: [],
  clocks: [],
  clockSettings: {
    "long-break-time": "30",
    "short-break-time": "10",
    "long-break-count": "4",
    "notify": true
  },
  crons: []
};

interface Options {
  dbFile: string;
}

type Schema = typeof DEFAULT_DB;

export default class Client {
  private db: low.LowdbSync<Schema>;
  constructor(options: Options) {
    this.db = low(new FileSync<Schema>(options.dbFile));
  }
}
