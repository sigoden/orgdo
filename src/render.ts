import Task, { TaskPriority, TaskStatus } from "Task";
import chalk from "chalk";
import * as os from "os";

const COLORS = {
  cancel: chalk.red,
  done: chalk.green,
  todo: chalk.white,
  describe: chalk.gray,
  doing: chalk.yellow,
  high: chalk.bgRed.black,
  low: chalk.bgYellow.black,
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
  return renderSummaryTable(table);
}

export function renderSummaryTable(table: TasksSumaryTable): string {
  const columns = Object.keys(table.all);
  const arr = [];
  let titleLine = "";
  let dashLine = "";
  const sizes = columns.map(key => {
    const size = Math.max(
      key.length,
      ...Object.keys(table).map(k => table[k][key].toString().length)
    );
    titleLine += `| ${paddingRight(key, size)} `;
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
      a += `| ${paddingRight(row[c].toString(), sizes[i])} `;
      return a;
    }, "");
    arr.push(line + "|");
  });
  return arr.join(os.EOL);
}

export function renderTasks(tasks: Task[]): string {
  const indent = Math.max(...tasks.map(task => task.id)).toString().length + 2;
  const taskstr = tasks.map(task => renderTask(task, indent)).join(os.EOL);
  return taskstr ? os.EOL + taskstr + os.EOL : "";
}

export function renderTask(task: Task, indent: number): string {
  let ret = "";
  ret += renderId(task.id, indent - 2) + ". " + renderMarkd(task.name);
  if (task.priority !== "medium") {
    ret += " " + renderPriority(task.priority);
  }
  ret = COLORS[task.status](ret);
  if (task.describe) {
    ret += os.EOL + renderDescribe(task.describe, indent);
  }
  ret = COLORS.describe(ret);
  const timestr = renderTimes(task);
  const tagstr = task.tags
    .map(tag => {
      return COLORS.tag("@" + tag);
    })
    .join(" ");
  if (timestr || tagstr) {
    ret += os.EOL;
    ret += " ".repeat(indent - 1);
    ret += timestr + " " + tagstr;
  }
  ret += os.EOL;
  return ret;
}

function renderId(id: number, indent: number): string {
  return (" ".repeat(indent) + String(id)).slice(-1 * indent);
}

function renderDescribe(describe: string, indent: number): string {
  const indentStr = " ".repeat(indent);
  return describe
    .split(os.EOL)
    .map(l => indentStr + l)
    .map(renderMarkd)
    .join(os.EOL);
}

function renderMarkd(str: string): string {
  return str
    .replace(/`(.*)`/g, COLORS.code("`$1`"))
    .replace(/~(.*)~/g, COLORS.strikethrough("~$1~"))
    .replace(/_(.*)_/g, COLORS.italic("_$1_"))
    .replace(/\*(.*)\*/g, COLORS.blod("*$1*"));
}

function renderPriority(priority: TaskPriority): string {
  return COLORS[priority](priority);
}

function renderTimeTag(kind: string, time: Date) {
  return COLORS.tag(`$${kind}(${dateformat(time)})`);
}

function renderTimes(task: Task) {
  let ret = "";
  if (task.start || task.rstart) {
    if (task.rstart) {
      ret += " " + renderTimeTag("rstart", task.rstart);
    } else {
      ret += " " + renderTimeTag("start", task.start);
    }
  }
  if (task.end || task.rend) {
    if (task.rend) {
      ret += " " + renderTimeTag("rend", task.rend);
    } else {
      ret += " " + renderTimeTag("end", task.end);
    }
  }
  return ret;
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
    const unfinishedNum = row.todo + row.doing;
    const allNum = unfinishedNum + row.cancel + row.done;
    row.all = allNum;
    row.percent = Math.round((100 * unfinishedNum) / allNum);
  });
  return table;
}

function newTaskSummeryTableRow(name: string): TasksSumaryTableColumn {
  return {
    group: name,
    todo: 0,
    doing: 0,
    done: 0,
    cancel: 0,
    all: 0,
    percent: 0
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
  cancel: number;
  all: number;
  percent: number;
}

function paddingRight(str: string, size: number) {
  return (str + " ".repeat(size)).slice(size);
}

function prependZero(str: string, size: number) {
  return ("0".repeat(size) + str).slice(-1 * size);
}

function dateformat(date: Date): string {
  const year = ("" + date.getFullYear()).slice(-2);
  const month = prependZero("" + (date.getMonth() + 1), 2);
  const day = prependZero("" + date.getDate(), 2);
  const hour = prependZero("" + date.getHours(), 2);
  const minute = prependZero("" + date.getMinutes(), 2);
  const ymd = `${year}-${month}-${day}`;
  if (hour === "00" && minute === "00") {
    return ymd;
  }
  return ymd + ` ${hour}:${minute}`;
}
