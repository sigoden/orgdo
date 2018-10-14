import * as ipc from "node-ipc";
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";
import { IPC_SERVER_ID, IPC_APP_SPACE, PID_FILE, DATA_FILE } from "./constants";

ipc.config.appspace = IPC_APP_SPACE;
ipc.config.id = "client";
ipc.config.silent = true;

export default class IPC {
  private running: boolean;
  private dataFile: string;
  constructor(dataFile: string = DATA_FILE) {
    this.dataFile = dataFile;
  }
  public isRunning() {
    if (this.running) {
      return true;
    }
    let pid;
    try {
      pid = fs.readFileSync(PID_FILE, "utf8");
    } catch (err) {
      return false;
    }
    try {
      return process.kill(pid, 0);
    } catch (e) {
      return e.code === "EPERM";
    }
  }
  public async exec(action: string, data?: any) {
    if (!this.isRunning()) {
      await this.prepare();
    }
    return new Promise((resolve, reject) => {
      ipc.connectTo(IPC_SERVER_ID, () => {
        const server = ipc.of[IPC_SERVER_ID];
        server.on("error", err => {
          ipc.disconnect(IPC_SERVER_ID);
          reject(err);
        });
        server.on("connect", () => {
          server.emit(action, data);
        });
        server.on("response", res => {
          ipc.disconnect(IPC_SERVER_ID);
          resolve(res);
        });
      });
    });
  }
  private async prepare() {
    const ext = path.extname(__filename);
    const cmd = ext === ".ts" ? "ts-node" : "node";
    cp.spawn(cmd, [path.resolve(__dirname, "server" + ext), this.dataFile], {
      detached: true,
      stdio: "ignore"
    }).unref();
    await ensureSpawnReady();
    this.running = true;
  }
}

async function ensureSpawnReady(retry = 5) {
  return new Promise<void>((resolve, reject) => {
    // ensure server running
    ipc.connectTo(IPC_SERVER_ID, () => {
      const server = ipc.of[IPC_SERVER_ID];
      server.on("error", err => {
        retry--;
        if (retry === 0) {
          ipc.disconnect(IPC_SERVER_ID);
          reject(err);
        }
      });
      server.on("connect", () => {
        ipc.disconnect(IPC_SERVER_ID);
        resolve();
      });
    });
  });
}
