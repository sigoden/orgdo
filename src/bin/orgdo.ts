import * as yargs from "yargs";
import * as path from "path";

yargs
  .commandDir("cmds", {
    extensions: path.extname(__filename) === ".ts" ? ["ts", "js"] : ["js"]
  })
  .demandCommand(
    1,
    `Run 'orgdo <subcommand> --help' for more information on a command.`
  )
  .help()
  .parse();
