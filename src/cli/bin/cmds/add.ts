import * as yargs from "yargs";
import { AddOptions } from "../../Client";
import { client } from "../../";

export const command = "add <name>";
export const describe = "Add task";
export function builder(cli: yargs.Argv) {
  return cli
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
      type: "number"
    })
    .option("end", {
      describe: "Plan finish datetime of task",
      type: "number"
    })
    .positional("name", {
      describe: "Name of task",
      type: "string"
    });
}
export function handler(options: AddOptions) {
  client.add(options);
}
