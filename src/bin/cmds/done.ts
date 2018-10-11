import * as yargs from "yargs";
import { IdOptions } from "../../Cli";
import { cli } from "../../";

export const command = "done <id>";
export const describe = "Done task";
export function builder(cmd: yargs.Argv) {
  return cmd.positional("id", { describe: "Id of task", type: "number" });
}
export function handler(options: IdOptions) {
  cli.done(options);
}
