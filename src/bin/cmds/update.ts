import * as yargs from "yargs";
import Cli, { UpdateOptions } from "../../Cli";
import Client, { print } from "../../Client";

export const command = "update <id>";
export const describe = "Update task";
export function builder(cmd: yargs.Argv) {
  return cmd
    .option("add-tags", {
      describe: "Add tags to task",
      type: "string"
    })
    .option("remove-tags", {
      describe: "Remove tags from task",
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
    .positional("id", { describe: "Id of task", type: "number" });
}

export function handler(options: UpdateOptions) {
  Client.init().then(client => {
    new Cli(client).update(options).catch(err => print(err.message));
  });
}
