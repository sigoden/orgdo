import Client from "../src/Client";
import Cron from "../src/Cronjob";

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

let client: Client;
let cron: Cron;

const dataFile = path.resolve(__dirname, "orgdo.cron.json");

async function prepare() {
  try {
    fs.unlinkSync(dataFile);
  } catch (err) {}
  client = await Client.init({
    dataFile
  });
  cron = new Cron(client);
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

describe("crud cron", () => {
  beforeAll(prepare);
  test("add cron", async () => {
    const model = await cron.add({
      cron: "00 30 8 * * 1",
      task: "Add cron task"
    });
    const expectModel = { cron: "00 30 8 * * 1", id: 1, task: "Add cron task" };
    expect(mockIPCExec.mock.calls).toEqual([["cron.add", expectModel]]);
    expect(model).toEqual(expectModel);
  });
  test("add cron without task field", async () => {
    const model = await cron.add({
      cron: "00 30 8 * * 1"
    });
    const expectModel = { cron: "00 30 8 * * 1", id: 2, task: "Task 2" };
    expect(mockIPCExec.mock.calls).toEqual([["cron.add", expectModel]]);
    expect(model).toEqual(expectModel);
  });
  test("add cron throws error when cron pattern is invalid", async () => {
    try {
      await cron.add({
        cron: "oo 30 8 * * 1",
        task: "Add cron task"
      });
    } catch (err) {
      expect(err.message).toMatch("Invalid cron pattern");
    }
  });
  test("update cron", async () => {
    const updateDate = {
      id: 2,
      cron: "00 30 16 * * 1",
      task: "Update cron task"
    };
    const ret = await cron.update(updateDate);
    expect(mockIPCExec.mock.calls).toEqual([["cron.update", updateDate]]);
    expect(ret).toEqual(updateDate);
  });
  test("update cron throws error when cron does not exist", async () => {
    const updateDate = {
      id: 404,
      cron: "00 30 16 * * 1",
      task: "Update cron task"
    };
    try {
      await cron.update(updateDate);
    } catch (err) {
      expect(err.message).toMatch("not found");
    }
  });
  test("update cron throws error when cron pattern is invalid", async () => {
    const updateDate = {
      id: 2,
      cron: "oo 30 16 * * 1",
      task: "Update cron task"
    };
    try {
      await cron.update(updateDate);
    } catch (err) {
      expect(err.message).toMatch("Invalid cron pattern");
    }
  });
  test("remove cron", async () => {
    await cron.remove(2);
    expect(mockIPCExec.mock.calls).toEqual([["cron.remove", { id: 2 }]]);
  });
  test("list crons", async () => {
    const crons = await cron.list();
    expect(crons).toEqual([
      { cron: "00 30 8 * * 1", id: 1, task: "Add cron task" }
    ]);
  });
});
