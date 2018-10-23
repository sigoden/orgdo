import * as yargs from "yargs";
import Cli, { IdOptions } from "../../Cli";
import Client, { print, printErrorAndExit } from "../../Client";

export const command = ["rm <id>", "remove", "del", "delete"];
export const describe = "Remove task";
export function builder(cmd: yargs.Argv) {
  return cmd.positional("id", { describe: "Id of task", type: "number" });
}
export function handler(options: IdOptions) {
  Client.init().then(client => {
    new Cli(client)
      .remove(options)
      .then(() => {
        print(`Remove task ${options.id}.`);
      })
      .catch(err => printErrorAndExit(err));
  });
}
