import * as yargs from "yargs";

yargs
  .commandDir("cmds", {
    extensions: ["js", "ts"]
  })
  .demandCommand(
    1,
    `Run 'orgdo <subcommand> --help' for more information on a command.`
  )
  .help()
  .parse();
