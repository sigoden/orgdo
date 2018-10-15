#!/usr/bin/env node

import * as yargs from "yargs";
import * as path from "path";
import * as updateNotifier from "update-notifier";

updateNotifier({ pkg: require("../../package.json") }).notify();

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
