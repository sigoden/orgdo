import * as yargs from "yargs";
import Cli, { AddOptions } from "../../Cli";
import Client, { print } from "../../Client";

export const command = "add <name>";
export const describe = "Add task";
export function builder(cmd: yargs.Argv) {
  return cmd
    .option("tags", {
      describe: "Tags of task",
      type: "array"
    })
    .option("describe", {
      describe: "Describe of task",
      type: "string"
    })
    .option("priority", {
      describe: "Priority of task",
      type: "string"
    })
    .option("start", {
      describe: "Plan start datetime of task",
      type: "string"
    })
    .option("end", {
      describe: "Plan finish datetime of task",
      type: "string"
    })
    .positional("name", {
      describe: "Name of task",
      type: "string"
    });
}
export function handler(options: AddOptions) {
  Client.init().then(client => {
    new Cli(client).add(options).catch(err => print(err.message));
  });
}
