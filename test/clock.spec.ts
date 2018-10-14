import Client from "../src/Client";
import Clock from "../src/Clock";
const mockIPCIsRunning = jest.fn();
const mockIPCExec = jest.fn();
jest.mock("../src/IPC", () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        isRunning: mockIPCIsRunning,
        exec: mockIPCExec
      };
    })
  };
});

import * as path from "path";
import * as fs from "fs";
import Task from "../src/Task";

let client: Client;
let clock: Clock;

const dataFile = path.resolve(__dirname, "orgdo.clock.json");

async function prepare() {
  try {
    fs.unlinkSync(dataFile);
  } catch (err) {}
  client = await Client.init({
    dataFile
  });
  clock = new Clock(client);
  await client.addTask(Task.create({ id: 3, name: "A task" }));
}

afterAll(() => {
  try {
    fs.unlinkSync(dataFile);
  } catch (err) {}
});

beforeEach(() => {
  mockIPCExec.mockClear();
  mockIPCIsRunning.mockClear();
});

describe("crud clocks", () => {
  beforeAll(prepare);
  test("start clock", async () => {
    mockIPCExec.mockImplementation(async (action, data) => {
      if (action === "clock.state") {
        return { type: "idle", time: 0 };
      } else if (action === "clock.start") {
        return {};
      }
    });
    await clock.start();
    expect(mockIPCExec.mock.calls).toEqual([
      ["clock.state"],
      ["clock.start", { breakTime: 10, next: "short", workTime: 25 }]
    ]);
  });
  test("start clock when clock is already running", async () => {
    mockIPCExec.mockImplementation(async (action, data) => {
      if (action === "clock.state") {
        return { type: "idle", time: 0 };
      }
    });
    try {
      await clock.start();
    } catch (err) {
      expect(err).toMatch("Clock is running");
    }
  });
  test("start clock with task id", async () => {
    mockIPCExec.mockImplementation(async (action, data) => {
      if (action === "clock.state") {
        return { type: "idle", time: 0 };
      }
      return {};
    });
    await clock.start(3);
    expect(mockIPCExec.mock.calls).toEqual([
      ["clock.state"],
      ["clock.start", { breakTime: 10, next: "short", workTime: 25, taskId: 3 }]
    ]);
  });
  test("stop clock", async () => {
    mockIPCIsRunning.mockImplementation(() => true);
    mockIPCExec.mockImplementation(async (action, data) => {
      if (action === "clock.state") {
        return { type: "running", time: 240 };
      }
    });
    await clock.stop();
    expect(mockIPCExec.mock.calls).toEqual([["clock.state"], ["clock.stop"]]);
  });
  test("stop clock when ipc server is not running", async () => {
    mockIPCIsRunning.mockImplementation(() => false);
    mockIPCExec.mockImplementation(async (action, data) => {
      if (action === "clock.state") {
        return { type: "running", time: 240 };
      }
    });
    await clock.stop();
    expect(mockIPCExec.mock.calls).toEqual([]);
  });
  test("stop clock when clock is idle", async () => {
    mockIPCIsRunning.mockImplementation(() => true);
    mockIPCExec.mockImplementation(async (action, data) => {
      if (action === "clock.state") {
        return { type: "idle", time: 0 };
      }
      return {};
    });
    await clock.stop();
    expect(mockIPCExec.mock.calls).toEqual([["clock.state"]]);
  });
  test("get clock status", async () => {
    mockIPCExec.mockImplementation(async (action, data) => {
      if (action === "clock.state") {
        return { type: "idle", time: 0 };
      }
      return {};
    });
    const ret = await clock.status();
    expect(ret).toEqual({ index: 0, state: { time: 0, type: "idle" } });
    expect(mockIPCExec.mock.calls).toEqual([["clock.state"]]);
  });
  test("get clock status (shortbreaking)", async () => {
    mockIPCExec.mockImplementation(async (action, data) => {
      if (action === "clock.state") {
        return { type: "shortbreaking", time: 320 };
      }
      return {};
    });
    await client.addClock({ time: 30, taskId: 3 });
    const ret = await clock.status();
    expect(ret).toEqual({
      index: 1,
      state: { time: 320, type: "shortbreaking" }
    });
    expect(mockIPCExec.mock.calls).toEqual([["clock.state"]]);
  });
  test("update clock (noop)", async () => {
    const ret = await clock.update({});
    expect(ret).toEqual({
      "long-break-count": 4,
      "long-break-time": 30,
      "short-break-time": 10,
      "work-time": 25
    });
  });
  test("update clock", async () => {
    const updates = {
      "long-break-count": 2,
      "long-break-time": 30,
      "short-break-time": 10,
      "work-time": 45
    };
    const ret = await clock.update(updates);
    expect(ret).toEqual(updates);
  });
});

describe("list clocks", () => {
  beforeAll(async () => {
    await prepare();
    const clocks = require("./fixtures/clocks.json");
    await client.db
      .set("clocks", clocks)
      .set("clockId", clocks.length)
      .write();
  });
  test("list clocks", async () => {
    const clocks = await clock.list({
      after: "2018-10-01",
      before: "2018-10-05"
    });
    expect(clocks.map(v => v.id)).toEqual([4, 5]);
  });
  test("list clocks today", async () => {
    const model = await client.addClock({ time: 30 });
    const clocks = await clock.list({});
    expect(clocks).toHaveLength(1);
    expect(clocks[0]).toEqual(model);
  });
});
