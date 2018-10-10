import Client from "./Client";
import Cron from "./Cron";
import Clock from "./Clock";

export const client = new Client();
export const cron = new Cron(client);
export const clock = new Clock(client);
