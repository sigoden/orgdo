import * as ipc from "node-ipc";
import { StartClockArgs } from "./Clock";
import Client, { PID_FILE } from "./Client";
import * as notifier from "node-notifier";
import * as fs from "fs";

ipc.config.appspace = "orgdo.";
ipc.config.id = "server";
ipc.config.silent = true;

const dataFile = process.argv[2];

const clockSession = {
  timer: null,
  state: "idle",
  getRemain: null
};

const MINUTE_TO_MS = 60000;

function calcuateRemain(minutes: number) {
  const time = Date.now();
  return () => {
    const now = Date.now();
    return minutes * 60 - Math.ceil((now - time) / 1000);
  };
}

try {
  fs.writeFileSync(PID_FILE, process.pid);
} catch (err) {}

process.on("SIGINT", () => {
  fs.unlinkSync(PID_FILE);
  process.exit();
});

ipc.serve(() => {
  ipc.server.on("clock.state", (data, socket) => {
    ipc.server.emit(socket, "response", {
      type: clockSession.state,
      time: clockSession.getRemain ? clockSession.getRemain() : 0
    });
  });
  ipc.server.on("clock.start", (data: StartClockArgs, socket) => {
    clockSession.getRemain = calcuateRemain(data.workTime);
    clockSession.state = "running";
    clockSession.timer = setTimeout(() => {
      clockSession.getRemain = calcuateRemain(data.breakTime);
      clockSession.state =
        data.next === "long" ? "longbreaking" : "shortbreaking";
      notify(`You timer is up, take a ${data.next} break`);
      notify(`${data.workTime} minutes of work done. You deserve a break!`);
      clockSession.timer = setTimeout(() => {
        clockSession.state = "idle";
        notify(`Your break of ${data.breakTime} minutes is over.`);
      }, data.breakTime * MINUTE_TO_MS);
      Client.init({ dataFile }).then(client => {
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
});

ipc.server.start();

function notify(msg) {
  notifier.notify({
    title: "Orgdo",
    message: msg
  });
}
