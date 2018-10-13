import * as ipc from "node-ipc";
import * as cp from "child_process";
import * as path from "path";

const SERVER_ID = "server";

ipc.config.appspace = "orgdo.";
ipc.config.id = "client";
ipc.config.silent = true;

export async function runServer(dataFile: string) {
  const ext = path.extname(__filename);
  const cmd = ext === ".ts" ? "ts-node" : "node";
  const child = cp.spawn(
    cmd,
    [path.resolve(__dirname, "server" + ext), dataFile],
    {
      detached: true,
      stdio: "ignore"
    }
  );
  child.unref();
  return new Promise<cp.ChildProcess>((resolve, reject) => {
    // ensure server running
    ipc.connectTo(SERVER_ID, () => {
      const server = ipc.of[SERVER_ID];
      let retry = 5;
      server.on("error", err => {
        retry--;
        if (retry === 0) {
          ipc.disconnect(SERVER_ID);
          reject(err);
        }
      });
      server.on("connect", () => {
        ipc.disconnect(SERVER_ID);
        resolve(child);
      });
    });
  });
}

export function isServerRunning(pid: number) {
  try {
    return process.kill(pid, 0);
  } catch (e) {
    return e.code === "EPERM";
  }
}

export async function call(action: string, data?: any) {
  return new Promise((resolve, reject) => {
    ipc.connectTo(SERVER_ID, () => {
      const server = ipc.of[SERVER_ID];
      server.on("error", err => {
        ipc.disconnect(SERVER_ID);
        reject(err);
      });
      server.on("connect", () => {
        server.emit(action, data);
      });
      server.on("response", res => {
        ipc.disconnect(SERVER_ID);
        resolve(res);
      });
    });
  });
}
