import Client from "../src/Client";
import Cli from "../src/Cli";
import Task from "../src/Task";

import * as path from "path";
import * as fs from "fs";

let client: Client;
let cli: Cli;

const store = path.resolve(__dirname, ".orgdo.test.json");

async function prepare() {
  try {
    fs.unlinkSync(store);
  } catch (err) {}
  client = await Client.init({
    store
  });
  cli = new Cli(client);
}

afterAll(() => {
  try {
    fs.unlinkSync(store);
  } catch (err) {}
});

describe("crud task", () => {
  beforeAll(prepare);
  test("add task", async () => {
    const task = await cli.add({
      tags: ["project", "blog"],
      describe: "This is description of task",
      name: "This is a task",
      priority: "high",
      start: "99-10-18 10:30",
      complete: "99-10-20"
    });
    expect(task).toBeInstanceOf(Task);
    expect(JSON.stringify(task, null, 2)).toBe(`{
  "id": 1,
  "name": "This is a task",
  "status": "todo",
  "priority": "high",
  "tags": [
    "project",
    "blog"
  ],
  "describe": "This is description of task",
  "start": "2099-10-18T02:30:00.000Z",
  "complete": "2099-10-19T16:00:00.000Z"
}`);
  });
  test("update task", async () => {
    const task = await cli.update({
      "id": 1,
      "add-tags": ["easy"],
      "remove-tags": ["blog"],
      "name": "This is a task, updated",
      "priority": "low",
      "start": "1w 3",
      "complete": "2w"
    });
    expect(task.tags).toEqual(["project", "easy"]);
  });
  test("start task", async () => {
    const task = await cli.start({
      id: 1
    });
    expect(task.status).toEqual("doing");
    expect(task.started).toBeDefined();
  });
  test("done task", async () => {
    const task = await cli.done({
      id: 1
    });
    expect(task.status).toEqual("done");
    expect(task.completed).toBeDefined();
  });
  test("cancel task", async () => {
    const task = await cli.add({
      name: "A task to cancel"
    });
    expect(task.status).toBe("todo");
    expect(task.id).toBe(2);
    expect(task.priority).toBe("medium");

    await cli.cancel({
      id: 2
    });
  });
  test("remove task", async () => {
    await cli.remove({
      id: 2
    });
    try {
      await cli.get({
        id: 2
      });
    } catch (err) {
      expect(err).toBeDefined();
    }
  });
});

describe("list task", () => {
  beforeAll(async () => {
    await prepare();
    const tasks = require("./fixtures/tasks.json");
    const state = client.db.getState();
    client.db.setState({ ...state, tasks });
  });
  test("filter by tags (&&)", async () => {
    const tasks = await cli.list({ tags: ["project", "owner"] });
    expect(tasks.map(t => t.id)).toEqual([2]);
  });
  test("filter by tags (||)", async () => {
    const tasks = await cli.list({ tags: ["project,blog"] });
    expect(tasks.map(t => t.id)).toEqual([1, 2, 11]);
  });
  test("filter by priority", async () => {
    const tasks = await cli.list({ priority: "low" });
    expect(tasks.map(t => t.id)).toEqual([5, 11]);
  });
  test("filter by status", async () => {
    const tasks = await cli.list({ status: "cancel" });
    expect(tasks.map(t => t.id)).toEqual([9]);
  });
  test("filter by name", async () => {
    const tasks = await cli.list({ name: "description" });
    expect(tasks.map(t => t.id)).toEqual([1]);
  });
});

describe("list task by times", () => {
  beforeAll(async () => {
    await prepare();
    const tasks = [
      {
        id: 1,
        name: "Task",
        start: dayOffset(2),
        status: "todo"
      },
      {
        id: 2,
        name: "Task",
        start: dayOffset(2),
        complete: dayOffset(3),
        started: dayOffset(2),
        status: "doing"
      },
      {
        id: 3,
        name: "Task",
        complete: dayOffset(2),
        status: "todo"
      },
      {
        id: 4,
        name: "Task",
        start: dayOffset(4),
        complete: dayOffset(5),
        status: "todo"
      },
      {
        id: 5,
        name: "Task",
        start: dayOffset(-2),
        complete: dayOffset(-1),
        status: "todo"
      },
      {
        id: 6,
        name: "Task",
        start: dayOffset(-4),
        status: "todo"
      },
      {
        id: 7,
        name: "Task",
        started: dayOffset(2),
        status: "doing"
      },
      {
        id: 8,
        name: "Task",
        started: dayOffset(-4),
        completed: dayOffset(-2),
        status: "done"
      },
      {
        id: 9,
        name: "Task",
        completed: dayOffset(-2),
        status: "cancel"
      }
    ].map(task => Object.assign({ priority: "medium", tags: [] }, task));
    const state = client.db.getState();
    client.db.setState({ ...state, tasks });
  });
  test("filter by start", async () => {
    const tasks = await cli.list({ start: "3" });
    expect(tasks.map(t => t.id)).toEqual([1, 2, 3, 7, 8, 9]);
  });
  test("filter by start (>n)", async () => {
    const tasks = await cli.list({ start: ">3" });
    expect(tasks.map(t => t.id)).toEqual([3, 4, 7, 8, 9]);
  });
  test("filter by start (-n)", async () => {
    const tasks = await cli.list({ start: "-3" });
    expect(tasks.map(t => t.id)).toEqual([3, 5, 7, 8, 9]);
  });
  test("filter by start (<n)", async () => {
    const tasks = await cli.list({ start: "<3" });
    expect(tasks.map(t => t.id)).toEqual([3, 6, 7, 8, 9]);
  });
  test("filter by started", async () => {
    const tasks = await cli.list({ started: "3" });
    expect(tasks.map(t => t.id)).toEqual([2, 7]);
  });
  test("filter by complete", async () => {
    const tasks = await cli.list({ complete: "-3" });
    expect(tasks.map(t => t.id)).toEqual([1, 5, 6, 7, 8, 9]);
  });
  test("filter by completed", async () => {
    const tasks = await cli.list({ completed: "-3" });
    expect(tasks.map(t => t.id)).toEqual([8, 9]);
  });
});

function dayOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
