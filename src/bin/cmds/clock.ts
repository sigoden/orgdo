import * as yargs from "yargs";

export const command = "clock";
export const describe = "Manage tomato clocks";
export function builder(cmd: yargs.Argv) {
  return cmd
    .command("start", "Start clock", {}, (argv: yargs.Arguments) => {})
    .command("break", "Break clock", {}, (argv: yargs.Arguments) => {})
    .command(
      "status",
      "View clock config and status",
      {},
      (argv: yargs.Arguments) => {}
    )
    .command(
      "set",
      "Update clock settings",
      {
        "long-break-time": {
          describe: "Long break time of clock in minute",
          type: "number"
        },
        "short-break-time": {
          describe: "Long break time of clock in minute",
          type: "number"
        },
        "long-break-count": {
          describe: "How many clocks when take a long break",
          type: "number"
        },
        "notify": {
          describe: "Enable/Disable notification when clock is finishing",
          type: "boolean"
        }
      },
      (argv: yargs.Arguments) => {}
    )
    .command("list", "List clocks", {}, (argv: yargs.Arguments) => {})
    .demandCommand(
      1,
      `Run 'orgdo clock <subcommand> --help' for more information on a command.`
    );
}
export function handler(argv: yargs.Arguments) {}
