import Client from "./Client";

import Cli from "./Cli";
import Cron from "./Cron";
import Clock from "./Clock";

export const client = new Client({
  dbFile: "db.test.json"
});

export const cli = new Cli(client);
export const cron = new Cron(client);
export const clock = new Clock(client);
