import * as os from "os";
import * as path from "path";

export const DATA_DIR = path.resolve(os.homedir(), ".orgdo");
export const DATA_FILE = path.resolve(DATA_DIR, "orgdo.json");
export const PID_FILE = path.resolve(DATA_DIR, "orgdo.pid");
export const IPC_APP_SPACE = "orgdo.";
export const IPC_SERVER_ID = "server";
export const DEFAULT_DB = {
  tasks: [],
  taskId: 0,
  clocks: [],
  clockId: 0,
  crons: [],
  cronId: 0,
  clockSettings: {
    "work-time": 25,
    "long-break-time": 30,
    "short-break-time": 10,
    "long-break-count": 4
  }
};
