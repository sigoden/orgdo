import * as yargs from "yargs";

import Client, { print, printErrorAndExit } from "../../Client";
import Clock, {
  UpdateOptions,
  ListOptions,
  secondToTimeString
} from "../../Clock";
import * as _ from "lodash";
import * as render from "../../clock-render";

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
          new Clock(client)
            .start(options.id)
            .catch(err => printErrorAndExit(err));
        });
      }
    })
    .command({
      command: "stop",
      describe: "Stop clock",
      handler: (options: yargs.Arguments) => {
        Client.init().then(client => {
          new Clock(client).stop().catch(err => printErrorAndExit(err));
        });
      }
    })
    .command({
      command: "status",
      describe: "View current clock",
      handler: (options: yargs.Arguments) => {
        Client.init().then(client => {
          new Clock(client)
            .status()
            .then(data => {
              if (data.state.type !== "idle") {
                print(
                  `${data.state.type}: ${secondToTimeString(data.state.time)}`
                );
              } else {
                print(`No clock is running, done ${data.index} clocks today`);
              }
            })
            .catch(err => printErrorAndExit(err));
        });
      }
    })
    .command({
      command: "set",
      describe: "Update clock settings",
      builder: (subcmd: yargs.Argv) => {
        return subcmd
          .option("work-time", {
            describe: "Work time of clock in minute",
            type: "number"
          })
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
      handler: (options: yargs.Argv) => {
        Client.init().then(client => {
          new Clock(client)
            .update(<UpdateOptions> (
              _.pick(options, [
                "long-break-time",
                "short-break-time",
                "long-break-count",
                "work-time"
              ])
            ))
            .then(settings => {
              print(`long-break-time: ${settings["long-break-time"]}
short-break-time: ${settings["short-break-time"]}
long-break-count: ${settings["long-break-count"]}
work-time: ${settings["work-time"]}`);
            })
            .catch(err => printErrorAndExit(err));
        });
      }
    })
    .command({
      command: "stat",
      describe: "Show clocks statistic",
      builder: (subcmd: yargs.Argv) => {
        return subcmd
          .option("after", {
            describe: "List clock more recent than a specific date. yyyy-MM-dd",
            type: "string"
          })
          .option("before", {
            describe: "List clock older than a specific date. yyyy-MM-dd",
            type: "string"
          });
      },
      handler: (options: ListOptions) => {
        Client.init().then(client => {
          new Clock(client)
            .list(options)
            .then(clocks => {
              const ret = render.renderClocks(
                new Date(options.after),
                new Date(options.before),
                clocks
              );
              print(ret);
            })
            .catch(err => printErrorAndExit(err));
        });
      }
    })
    .demandCommand(
      1,
      `Run 'orgdo clock <subcommand> --help' for more information on a command.`
    );
}
export function handler(argv: yargs.Arguments) {}
