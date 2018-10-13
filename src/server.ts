import * as ipc from "node-ipc";
import { StartClockArgs } from "./Clock";
import Client from "./Client";
import * as notifier from "node-notifier";

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

let client: Client;

Client.init({ dataFile }).then(ret => {
  client = ret;
  ipc.server.start();
  process.on("SIGINT", () => {
    client.clearIpcPid();
    process.exit();
  });
});

ipc.serve(() => {
  ipc.server.on("clock.state", (data, socket) => {
    ipc.server.emit(socket, "response", {
      type: clockSession.state,
      time: clockSession.getRemain ? clockSession.getRemain() : 0
    });
  });
  ipc.server.on("clock.start", (data: StartClockArgs, socket) => {
    clockSession.state = "running";
    clockSession.getRemain = calcuateRemain(data.workTime);
    notify(`You timer is up, take a ${data.next} break`);
    clockSession.timer = setTimeout(() => {
      clockSession.state =
        data.next === "long" ? "longbreaking" : "shortbreaking";
      notify(`You timer is up, start a new clock`);
      clockSession.timer = setTimeout(() => {
        clockSession.getRemain = calcuateRemain(data.breakTime);
      }, data.breakTime * MINUTE_TO_MS);
      client.addClock({ taskId: data.taskId, time: data.workTime });
    }, data.workTime * MINUTE_TO_MS);
    ipc.server.emit(socket, "response", {});
  });
  ipc.server.on("clock.stop", (data, socket) => {
    clockSession.state = "idle";
    clearTimeout(clockSession.timer);
    ipc.server.emit(socket, "response", {});
  });
});

function notify(msg) {
  notifier.notify({
    title: "Orgdo",
    message: msg
  });
}
