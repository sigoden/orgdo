import * as yargs from "yargs";
import { cron } from "../../";

export const command = "cron";
export const describe = "Manage crons";
export function builder(cli: yargs.Argv) {
  return cli
    .command("add", "Add cron", {}, (argv: yargs.Arguments) => {
      cron.add(argv);
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
