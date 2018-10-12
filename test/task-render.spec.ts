import Task from "../src/Task";
import * as render from "../src/task-render";
import * as fs from "fs";
import * as path from "path";

let tasks: Task[];

(<any> process).TZ = "Asia/Shanghai";

beforeAll(() => {
  tasks = require("./fixtures/tasks.json").map(task => Task.fromJSON(task));
});

test("render tasks", async () => {
  const ret = render.renderTasks(tasks);
  const expectRet = fs.readFileSync(
    path.resolve(__dirname, "./fixtures/tasks.txt"),
    "utf8"
  );
  expect(ret).toEqual(expectRet);
});

test("render task statistics", async () => {
  const ret = render.renderTasksStatistic(tasks);
  const expectRet = fs.readFileSync(
    path.resolve(__dirname, "./fixtures/tasks-statistic.txt"),
    "utf8"
  );
  expect(ret).toEqual(expectRet);
});
