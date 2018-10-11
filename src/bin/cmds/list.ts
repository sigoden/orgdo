import * as yargs from "yargs";
import { ListOptions } from "../../Cli";
import { cli } from "../../";

export const command = "list";
export const describe = "List tasks";
export function builder(cmd: yargs.Argv) {
  return cmd
    .option("tags", {
      describe: "Filter based on tags",
      type: "array"
    })
    .option("priority", {
      describe: "Filter based on priority",
      choices: ["high", "medium", "low"]
    })
    .option("status", {
      describe: "Filter based on status",
      choices: ["todo", "doing", "done", "cancel"]
    })
    .option("name", {
      describe: "Filter based on name glob",
      type: "string"
    })
    .option("start", {
      describe: "Filter base on plan start datetime of task",
      type: "string"
    })
    .option("rstart", {
      describe: "Filter base on real start datetime of task",
      type: "string"
    })
    .option("end", {
      describe: "Filter base on plan end datetime of task",
      type: "string"
    })
    .option("rend", {
      describe: "Filter base on real end datetime of task",
      type: "string"
    })
    .option("with-statistic", {
      describe: "Show static of tasks",
      type: "boolean"
    })
    .option("only-statistic", {
      describe: "Show static of tasks only, hidden tasks list",
      type: "boolean"
    });
}

export function handler(options: ListOptions) {
  cli.list(options);
}
