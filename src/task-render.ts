import Task from "Task";
import chalk from "chalk";
import * as os from "os";

import { paddingLeft, shortTimeStr, dateFormat } from "./utits";

const COLORS = {
  canceled: chalk.red,
  done: chalk.green,
  todo: chalk.white,
  describe: chalk.gray,
  doing: chalk.yellow,
  high: chalk.bgRed.black,
  low: chalk.bgBlue.black,
  medium: chalk.bgGreen.black,
  blod: chalk.bold,
  italic: chalk.italic,
  strikethrough: chalk.strikethrough,
  code: chalk.cyan,
  tag: chalk.magenta
};

export function renderTasksStatistic(tasks: Task[]): string {
  if (tasks.length === 0) {
    return "";
  }
  const table = newTaskSummeryTable(tasks);
  return renderSummaryTable(table) + os.EOL;
}

function renderSummaryTable(table: TasksSumaryTable): string {
  const columns = Object.keys(table.all);
  const arr = [];
  let titleLine = "";
  let dashLine = "";
  const sizes = columns.map(key => {
    const size = Math.max(
      key.length,
      ...Object.keys(table).map(k => table[k][key].toString().length)
    );
    titleLine += `| ${paddingLeft(key, size)} `;
    dashLine += `| ${"-".repeat(size)} `;
    return size;
  });
  arr.push(titleLine + "|");
  arr.push(dashLine + "|");
  // move all to bottom
  const groupNames = Object.keys(table);
  groupNames.slice(1).push("all");
  groupNames.forEach(name => {
    const row = table[name];
    const line = columns.reduce((a, c, i) => {
      a += `| ${paddingLeft(row[c].toString(), sizes[i])} `;
      return a;
    }, "");
    arr.push(line + "|");
  });
  return arr.join(os.EOL);
}

export function renderTasks(tasks: Task[]): string {
  const taskstr = tasks.map(task => renderTask(task)).join(os.EOL);
  return taskstr ? os.EOL + taskstr + os.EOL : "";
}

function renderTask(task: Task): string {
  let ret = "";
  const indent = "   ";
  ret += renderSymbol(task) + indent.slice(0, -1);
  ret += COLORS[task.status](renderMarkd(task.name));
  ret += " " + renderId(task);
  if (task.describe) {
    ret += os.EOL;
    ret += COLORS.describe(
      renderMarkd(task.describe)
        .split(os.EOL)
        .map(l => indent + l)
        .join(os.EOL)
    );
  }
  // ret += COLORS.tag("#" + task.id);
  const timestr = renderTimes(task);
  const tagstr = renderTags(task);
  if (timestr || tagstr) {
    ret += os.EOL + indent;
    if (timestr) {
      ret += timestr;
    }
    if (tagstr) {
      ret += (timestr ? " " : "") + tagstr;
    }
  }
  ret += os.EOL;
  return ret;
}

function renderId(task: Task): string {
  return COLORS[task.priority]("#" + task.id);
}

function renderMarkd(str: string): string {
  return str
    .replace(/`(.*)`/g, COLORS.code("`$1`"))
    .replace(/~(.*)~/g, COLORS.strikethrough("~$1~"))
    .replace(/_(.*)_/g, COLORS.italic("_$1_"))
    .replace(/\*(.*)\*/g, COLORS.blod("*$1*"));
}

function renderSymbol(task: Task): string {
  let symbol = "";
  switch (task.status) {
    case "todo":
      symbol = "☐";
      break;
    case "done":
      symbol = "✔";
      break;
    case "canceled":
      symbol = "✘";
      break;
    case "doing":
      symbol = "❍";
      break;
  }
  return COLORS[task.status](symbol);
}

function renderTimeTag(kind: string, time: Date) {
  return COLORS.tag(`$${kind}(${shortTimeStr(dateFormat(time))})`);
}

function renderTimes(task: Task) {
  const times = [];
  if (task.start || task.started) {
    if (task.started) {
      times.push(renderTimeTag("started", task.started));
    } else {
      times.push(renderTimeTag("start", task.start));
    }
  }
  if (task.complete || task.completed) {
    if (task.completed) {
      times.push(renderTimeTag("completed", task.completed));
    } else {
      times.push(renderTimeTag("complete", task.complete));
    }
  }
  return times.join(" ");
}

function renderTags(task: Task) {
  return task.tags
    .map(tag => {
      return COLORS.tag("@" + tag);
    })
    .join(" ");
}

function newTaskSummeryTable(tasks: Task[]) {
  const table: TasksSumaryTable = {
    all: newTaskSummeryTableRow("all")
  };
  for (const task of tasks) {
    table.all[task.status]++;
    task.tags.forEach(tag => {
      if (!table[tag]) {
        table[tag] = newTaskSummeryTableRow(tag);
      }
      table[tag][task.status]++;
    });
  }
  Object.keys(table).forEach(key => {
    const row = table[key];
    const finishedNum = row.canceled + row.done;
    const unfinishedNum = row.todo + row.doing;
    const allNum = unfinishedNum + finishedNum;
    row.all = allNum;
    const percent = Math.round((100 * finishedNum) / allNum);
    row.percent = percent === 0 ? "0" : "" + percent + "%";
  });
  return table;
}

function newTaskSummeryTableRow(name: string): TasksSumaryTableColumn {
  return {
    group: name,
    todo: 0,
    doing: 0,
    done: 0,
    canceled: 0,
    all: 0,
    percent: "0"
  };
}

interface TasksSumaryTable {
  all: TasksSumaryTableColumn;
  [k: string]: TasksSumaryTableColumn;
}

interface TasksSumaryTableColumn {
  group: string;
  todo: number;
  doing: number;
  done: number;
  canceled: number;
  all: number;
  percent: string;
}
