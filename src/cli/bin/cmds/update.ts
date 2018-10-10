import * as yargs from "yargs";
import { UpdateOptions } from "../../Client";
import { client } from "../..";

export const command = "update <id>";
export const describe = "Update task";
export function builder(cli: yargs.Argv) {
  return cli
    .option("tags", {
      describe: "Tags of task",
      type: "string"
    })
    .option("name", {
      describe: "Name of task",
      type: "string"
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
    .positional("id", { describe: "Id of task" });
}

export function handler(options: UpdateOptions) {
  client.update(options);
}
