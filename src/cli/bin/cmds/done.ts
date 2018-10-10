import * as yargs from "yargs";
import { IdOptions } from "../../Client";
import { client } from "../../";

export const command = "done <id>";
export const describe = "Done task";
export function builder(cli: yargs.Argv) {
  return cli.positional("id", { describe: "Id of task", type: "number" });
}
export function handler(options: IdOptions) {
  client.done(options);
}
