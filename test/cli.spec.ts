import Client from "../src/Client";
import Cli from "../src/Cli";
import Task from "../src/Task";
import * as os from "os";

import * as path from "path";
import * as fs from "fs";

let client: Client;
let cli: Cli;

async function prepare() {
  const store = path.resolve(__dirname, ".orgdo.test.json");
  try {
    fs.unlinkSync(store);
  } catch (err) {}
  client = await Client.init({
    store
  });
  cli = new Cli(client);
}

describe("crud task", () => {
  beforeAll(prepare);
  test("add task", async () => {
    const task = await cli.add({
      tags: ["project", "blog"],
      describe: "This is description of task",
      name: "This is a task",
      priority: "high",
      start: "99-10-18 10:30",
      end: "99-10-20"
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
  "end": "2099-10-19T16:00:00.000Z"
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
      "end": "2w"
    });
    expect(task.tags).toEqual(["project", "easy"]);
  });
  test("start task", async () => {
    const task = await cli.start({
      id: 1
    });
    expect(task.status).toEqual("doing");
    expect(task.rstart).toBeDefined();
  });
  test("done task", async () => {
    const task = await cli.done({
      id: 1
    });
    expect(task.status).toEqual("done");
    expect(task.rend).toBeDefined();
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
  beforeAll(prepare);
  test("add batch tasks", async () => {
    await cli.add({
      name: "Task minial"
    });
    await cli.add({
      name: "Task full",
      tags: ["project", "blog"],
      describe: "This is description of task",
      priority: "high",
      start: "2099-10-18 10:30",
      end: "2099-10-20"
    });
    await cli.add({
      name: "Task with multiple describe",
      priority: "low",
      describe:
        "This is description of task" + os.EOL + "Another line of description"
    });
    await cli.add({
      name: "Task with marked describe",
      describe: "This is *marked* _description_ ~of~ `task`"
    });
  });
  test("list tasks", async () => {
    const ret = await cli.list({});
  });
});
