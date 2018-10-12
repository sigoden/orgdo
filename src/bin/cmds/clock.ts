import * as yargs from "yargs";

import Client, { print } from "../../Client";
import Clock, { UpdateOptions, ListOptions } from "../../Clock";

export const command = "clock";
export const describe = "Manage tomato clocks";
export function builder(cmd: yargs.Argv) {
  return cmd
    .command({
      command: "start [id]",
      describe: "Start clock",
      builder: (subcmd: yargs.Argv) => {
        return subcmd.positional("id", {
          describe: "Id of task",
          type: "number"
        });
      },
      handler: (options: yargs.Arguments) => {
        Client.init().then(client => {
          new Clock(client).start(options.id).catch(err => print(err.message));
        });
      }
    })
    .command({
      command: "stop",
      describe: "Stop clock",
      handler: (options: yargs.Arguments) => {
        Client.init().then(client => {
          new Clock(client).stop().catch(err => print(err.message));
        });
      }
    })
    .command({
      command: "status",
      describe: "View clock config and status",
      handler: (options: yargs.Arguments) => {
        Client.init().then(client => {
          new Clock(client).status().catch(err => print(err.message));
        });
      }
    })
    .command({
      command: "set",
      describe: "Update clock settings",
      builder: (subcmd: yargs.Argv) => {
        return subcmd
          .option("long-break-time", {
            describe: "Long break time of clock in minute",
            type: "number"
          })
          .option("short-break-time", {
            describe: "Short break time of clock in minute",
            type: "number"
          })
          .option("long-break-count", {
            describe: "How many clocks when take a long break",
            type: "number"
          });
      },
      handler: (options: UpdateOptions) => {
        Client.init().then(client => {
          new Clock(client).update(options).catch(err => print(err.message));
        });
      }
    })
    .command({
      command: "list",
      describe: "List clocks",
      builder: (subcmd: yargs.Argv) => {
        return subcmd
          .option("aggregate", {
            describe: "Aggregate clocks data",
            choices: ["month", "week", "day"],
            type: "string"
          })
          .option("after", {
            describe: "List clock more recent than a specific date.",
            type: "string"
          })
          .option("before", {
            describe: "List clock older than a specific date.",
            type: "string"
          });
      },
      handler: (options: ListOptions) => {
        Client.init().then(client => {
          new Clock(client).list(options).catch(err => print(err.message));
        });
      }
    })
    .demandCommand(
      1,
      `Run 'orgdo clock <subcommand> --help' for more information on a command.`
    );
}
export function handler(argv: yargs.Arguments) {}
