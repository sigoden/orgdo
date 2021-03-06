import * as yargs from "yargs";

import Client, { print, printErrorAndExit } from "../../Client";
import Cron, { AddOptions, UpdateOptions, CronModel } from "../../Cronjob";
import { paddingRight } from "../../utits";

export const command = "cron";
export const describe = "Manage cronjobs";
export function builder(cmd: yargs.Argv) {
  return cmd
    .command({
      command: "add <cron>",
      describe: "Add cron job",
      builder: (subcmd: yargs.Argv) => {
        return subcmd
          .option("task", {
            describe: "Name of task",
            type: "string"
          })
          .positional("cron", {
            describe: "Cron pattern",
            type: "string"
          });
      },
      handler: (options: AddOptions) => {
        Client.init().then(client => {
          new Cron(client)
            .add(options)
            .then(cron => {
              print(`Add cron ${cron.id}.`);
            })
            .catch(err => printErrorAndExit(err));
        });
      }
    })
    .command({
      command: "update <id>",
      describe: "Update cron job",
      builder: (subcmd: yargs.Argv) => {
        return subcmd
          .option("task", {
            describe: "Name of task",
            type: "string"
          })
          .option("cron", {
            describe: "Cron pattern",
            type: "string"
          })
          .positional("id", {
            describe: "Id of cronjob",
            type: "number"
          });
      },
      handler: (options: UpdateOptions) => {
        Client.init().then(client => {
          new Cron(client)
            .update(options)
            .then(cron => {
              print(`Update cron ${cron.id}.`);
            })
            .catch(err => printErrorAndExit(err));
        });
      }
    })
    .command({
      command: ["rm <id>", "remove", "del", "delete"],
      describe: "Remove cron job",
      builder: (subcmd: yargs.Argv) => {
        return subcmd.positional("id", {
          describe: "Id of cronjob",
          type: "number"
        });
      },
      handler: (options: yargs.Arguments) => {
        Client.init().then(client => {
          new Cron(client)
            .remove(options.id)
            .then(() => {
              print(`Remove cron ${options.id}.`);
            })
            .catch(err => printErrorAndExit(err));
        });
      }
    })
    .command({
      command: ["list", "ls"],
      describe: "List cron jobs",
      builder: {},
      handler: (options: yargs.Arguments) => {
        Client.init().then(client => {
          new Cron(client)
            .list()
            .then(models => {
              if (models.length === 0) {
                print("No crons.");
                return;
              }
              const cronColumnWidth = Math.max(
                ...models.map(model => model.cron.length)
              );
              models.forEach(model =>
                print(renderCron(model, cronColumnWidth))
              );
            })
            .catch(err => printErrorAndExit(err));
        });
      }
    })
    .demandCommand(
      1,
      `Run 'orgdo cron <subcommand> --help' for more information on a command.`
    );
}
export function handler(argv: yargs.Arguments) {}

function renderCron(model: CronModel, cronColumnWidth: number) {
  return `${paddingRight(String(model.id), 3)}\t${paddingRight(
    model.cron,
    cronColumnWidth
  )}\t${model.task}`;
}
