import * as yargs from "yargs";

import Client from "../../Client";
import Cron from "../../Cron";

export const command = "cron";
export const describe = "Manage crons";
export function builder(cmd: yargs.Argv) {
  return cmd
    .command("add", "Add cron", {}, (argv: yargs.Arguments) => {
      Client.init().then(client => {
        new Cron(client).add(argv);
      });
    })
    .command("update", "Update cron", {}, (argv: yargs.Arguments) => {})
    .command("rm", "Remove cron", {}, (argv: yargs.Arguments) => {})
    .command("list", "List cron", {}, (argv: yargs.Arguments) => {})
    .demandCommand(
      1,
      `Run 'orgdo cron <subcommand> --help' for more information on a command.`
    );
}
export function handler(argv: yargs.Arguments) {}
