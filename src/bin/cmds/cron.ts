import * as yargs from "yargs";

import Client, { print, printErrorAndExit } from "../../Client";
import CronJob, { AddOptions, UpdateOptions, CronModel } from "../../CronJob";

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
            describe: "Cronjob pattern",
            type: "string"
          });
      },
      handler: (options: AddOptions) => {
        Client.init().then(client => {
          new CronJob(client).add(options).catch(err => printErrorAndExit(err));
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
            describe: "Cronjob pattern",
            type: "string"
          })
          .positional("id", {
            describe: "Id of cronjob",
            type: "number"
          });
      },
      handler: (options: UpdateOptions) => {
        Client.init().then(client => {
          new CronJob(client).update(options).catch(err => printErrorAndExit(err));
        });
      }
    })
    .command({
      command: "rm <id>",
      describe: "Remove cron job",
      builder: (subcmd: yargs.Argv) => {
        return subcmd.positional("id", {
          describe: "Id of cronjob",
          type: "number"
        });
      },
      handler: (options: yargs.Arguments) => {
        Client.init().then(client => {
          new CronJob(client)
            .remove(options.id)
            .catch(err => printErrorAndExit(err));
        });
      }
    })
    .command({
      command: "list",
      describe: "List cron jobs",
      builder: {},
      handler: (options: yargs.Arguments) => {
        Client.init().then(client => {
          new CronJob(client)
            .list()
            .then(models => {
              const cronColumnWidth = Math.max(
                ...models.map(model => model.cron.length)
              );
              models.forEach(model =>
                print(renderCronJob(model, cronColumnWidth))
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

function paddingRight(str: string, size: number) {
  return (" ".repeat(size) + str).slice(-1 * size);
}

function renderCronJob(model: CronModel, cronColumnWidth: number) {
  return `${paddingRight(String(model.id), 3)}\t${paddingRight(
    model.cron,
    cronColumnWidth
  )}\t${model.task}`;
}
