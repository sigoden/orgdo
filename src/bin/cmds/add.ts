import * as yargs from "yargs";
import Cli, { AddOptions } from "../../Cli";
import Client, { print, printErrorAndExit } from "../../Client";
import { strToArr } from "../../utits";

export const command = "add <name>";
export const describe = "Add task";
export function builder(cmd: yargs.Argv) {
  return cmd
    .option("tags", {
      describe: "Tags of task",
      type: "string"
    })
    .option("describe", {
      describe: "Describe of task",
      type: "string"
    })
    .option("priority", {
      describe: "Priority of task",
      choices: ["high", "low"]
    })
    .option("start", {
      describe: "When to start task",
      type: "string"
    })
    .option("complete", {
      describe: "When to complete task",
      type: "string"
    })
    .positional("name", {
      describe: "Name of task",
      type: "string"
    });
}
export function handler(options: AddOptions) {
  strToArr(options, "tags");
  Client.init().then(client => {
    new Cli(client)
      .add(options)
      .then(task => print(`Add task ${task.id}.`))
      .catch(err => printErrorAndExit(err));
  });
}
