import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on("line", line => {});

process.stdout.write("Orgdo dammon to process clock and cron\n");
