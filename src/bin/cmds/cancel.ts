import * as yargs from "yargs";
import Cli, { IdOptions } from "../../Cli";
import Client, { printErrorAndExit } from "../../Client";

export const command = "cancel <id>";
export const describe = "Cancel task";
export function builder(cmd: yargs.Argv) {
  return cmd.positional("id", { describe: "Id of task", type: "number" });
}
export function handler(options: IdOptions) {
  Client.init().then(client => {
    new Cli(client).cancel(options).catch(err => printErrorAndExit(err));
  });
}
