import * as ipc from "node-ipc";
import { StartClockArgs } from "./Clock";
import Client from "./Client";
import * as notifier from "node-notifier";
import * as fs from "fs";
import { CronJob } from "cron";
import { CronModel } from "./Cronjob";
import Task from "./Task";
import { PID_FILE, IPC_APP_SPACE, IPC_SERVER_ID } from "./constants";

ipc.config.appspace = IPC_APP_SPACE;
ipc.config.id = IPC_SERVER_ID;
ipc.config.silent = true;

const DATA_FILE = process.argv[2];
const MINUTE_TO_MS = 60000;

const clockSession = {
  timer: null,
  state: "idle",
  getRemain: null
};

const cronSession: { [k: number]: CronJob } = {};

try {
  fs.writeFileSync(PID_FILE, process.pid);
} catch (err) {}

ipc.serve(() => {
  Client.init({ dataFile: DATA_FILE }).then(client => {
    client.listCrons().then(crons => {
      crons.forEach(model => addCronJob(model));
    });
  });
  ipc.server.on("clock.state", (data, socket) => {
    ipc.server.emit(socket, "response", {
      type: clockSession.state,
      time: clockSession.getRemain ? clockSession.getRemain() : 0
    });
  });
  ipc.server.on("clock.start", (data: StartClockArgs, socket) => {
    if (clockSession.timer) {
      clearTimeout(clockSession.timer);
    }
    clockSession.getRemain = remainGen(data.workTime);
    clockSession.state = "running";
    clockSession.timer = setTimeout(() => {
      clockSession.getRemain = remainGen(data.breakTime);
      clockSession.state =
        data.next === "long" ? "longbreaking" : "shortbreaking";
      notify(
        `You timer is up after worked ${data.workTime} minutes, take a ${
          data.next
        } break`
      );
      clockSession.timer = setTimeout(() => {
        clockSession.state = "idle";
        notify(`Your break of ${data.breakTime} minutes is over.`);
      }, data.breakTime * MINUTE_TO_MS);
      Client.init({ dataFile: DATA_FILE }).then(client => {
        client.addClock({ taskId: data.taskId, time: data.workTime });
      });
    }, data.workTime * MINUTE_TO_MS);
    ipc.server.emit(socket, "response", {});
  });
  ipc.server.on("clock.stop", (data, socket) => {
    clockSession.state = "idle";
    if (clockSession.timer) {
      clearTimeout(clockSession.timer);
    }
    ipc.server.emit(socket, "response", {});
  });
  ipc.server.on("cron.add", (data: CronModel, socket) => {
    addCronJob(data);
    ipc.server.emit(socket, "response", {});
  });
  ipc.server.on("cron.update", (data: CronModel, socket) => {
    removeCronJob(data.id);
    addCronJob(data);
    ipc.server.emit(socket, "response", {});
  });
  ipc.server.on("cron.update", (data, socket) => {
    removeCronJob(data.id);
    ipc.server.emit(socket, "response", {});
  });
});

process.on("SIGINT", () => {
  fs.unlinkSync(PID_FILE);
  process.exit();
});

ipc.server.start();

function notify(msg) {
  notifier.notify({
    title: "Orgdo",
    message: msg
  });
}

function remainGen(minutes: number) {
  const time = Date.now();
  return () => {
    const now = Date.now();
    return minutes * 60 - Math.ceil((now - time) / 1000);
  };
}

function addCronJob(model: CronModel) {
  const job = new CronJob(model.cron, () => {
    Client.init({ dataFile: DATA_FILE }).then(client => {
      client.incId("taskId").then(id => {
        client.addTask(Task.create({ id, name: model.task, tags: ["cron"] }));
      });
    });
  });
  cronSession[model.id] = job;
  job.start();
}

function removeCronJob(id: number) {
  if (cronSession[id]) {
    cronSession[id].stop();
  }
}
