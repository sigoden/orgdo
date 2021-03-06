import * as yargs from "yargs";
import Cli, { ListOptions } from "../../Cli";
import Client, { print, printErrorAndExit } from "../../Client";
import { strToArr } from "../../utits";
import * as render from "../../task-render";

export const command = ["list", "ls"];
export const describe = "List tasks";
export function builder(cmd: yargs.Argv) {
  return cmd
    .option("all", {
      describe: "List all the tasks",
      type: "boolean"
    })
    .option("tags", {
      describe: "Filter based on tags",
      type: "string"
    })
    .option("priority", {
      describe: "Filter based on priority",
      choices: ["high", "medium", "low"]
    })
    .option("status", {
      describe: "Filter based on status",
      choices: ["todo", "doing", "done", "canceled"]
    })
    .option("name", {
      describe: "Filter based on name regexp",
      type: "string"
    })
    .option("start", {
      describe: "Filter base on start time of task",
      type: "string"
    })
    .option("started", {
      describe: "Filter base on started time of task",
      type: "string"
    })
    .option("complete", {
      describe: "Filter base on complete time of task",
      type: "string"
    })
    .option("completed", {
      describe: "Filter base on completed time of task",
      type: "string"
    })
    .option("with-stat", {
      describe: "Show static of tasks",
      type: "boolean"
    })
    .option("only-stat", {
      describe: "Show static of tasks only, hidden tasks list",
      type: "boolean"
    });
}

export function handler(options: ListOptions) {
  strToArr(options, "tags");
  Client.init().then(client => {
    if (Object.keys(options).length === 2) {
      options = {
        status: ["todo", "doing"],
        start: "1",
        complete: "1"
      };
    }
    new Cli(client)
      .list(options)
      .then(tasks => {
        if (tasks.length === 0) {
          print("No tasks.");
          return;
        }
        let ret = "";
        if (!options["only-stat"]) {
          ret += render.renderTasks(tasks);
        }
        if (options["with-stat"] || options["only-stat"]) {
          ret += render.renderTasksStatistic(tasks);
        }
        print(ret);
      })
      .catch(err => printErrorAndExit(err));
  });
}
