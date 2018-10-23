import * as yargs from "yargs";
import Cli, { UpdateOptions } from "../../Cli";
import Client, { print, printErrorAndExit } from "../../Client";
import { strToArr } from "../../utits";

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
      choices: ["high", "medium", "low"]
    })
    .option("start", {
      describe: "When to start task",
      type: "string"
    })
    .option("complete", {
      describe: "When to complete task",
      type: "string"
    })
    .positional("id", { describe: "Id of task", type: "number" });
}

export function handler(options: UpdateOptions) {
  strToArr(options, "add-tags");
  strToArr(options, "remove-tags");
  Client.init().then(client => {
    console.log(options);
    new Cli(client)
      .update(options)
      .then(task => {
        print(`Update task ${task.id}.`);
      })
      .catch(err => printErrorAndExit(err));
  });
}
