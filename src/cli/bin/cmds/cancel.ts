import * as yargs from "yargs";
import { IdOptions } from "../../Client";
import { client } from "../../";

export const command = "cancel <id>";
export const describe = "Cancel task";
export function builder(cli: yargs.Argv) {
  return cli.positional("id", { describe: "Id of task", type: "number" });
}
export function handler(options: IdOptions) {
  client.cancel(options);
}
