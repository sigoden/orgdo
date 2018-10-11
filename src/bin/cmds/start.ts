import * as yargs from "yargs";
import { IdOptions } from "../../Cli";
import { cli } from "../../";

export const command = "start <id>";
export const describe = "Start task";
export function builder(cmd: yargs.Argv) {
  return cmd.positional("id", { describe: "Id of task", type: "number" });
}
export function handler(options: IdOptions) {
  cli.start(options);
}
