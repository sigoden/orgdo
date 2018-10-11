import Task, { TaskPriority, TaskStatus } from "Task";
import chalk from "chalk";
import * as dateformat from "dateformat";
import * as os from "os";

const COLORS = {
  cancel: chalk.red,
  done: chalk.green,
  todo: chalk.reset,
  doing: chalk.yellow,
  high: chalk.bgRed.black,
  low: chalk.bgYellow.black,
  blod: chalk.bold.reset,
  italic: chalk.italic.reset,
  strikethrough: chalk.strikethrough.reset,
  code: chalk.cyan,
  tag: chalk.whiteBright
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
  return tasks.map(task => renderTask(task, indent)).join(os.EOL);
}

export function renderTask(task: Task, indent: number): string {
  let ret = "";
  ret +=
    renderId(task.id, indent - 2) + ". " + renderName(task.name, task.status);
  if (task.priority !== "medium") {
    ret += " " + renderPriority(task.priority);
  }
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
  task.tags.forEach(tag => {
    ret += " " + COLORS.tag("@" + tag);
  });
  if (task.describe) {
    ret += os.EOL + renderDescribe(task.describe, indent);
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

function renderName(name: string, status: TaskStatus) {
  return COLORS[status](name);
}

function renderMarkd(str: string): string {
  return str
    .replace(/`(.*)`/g, COLORS.code("`$1`"))
    .replace(/~(.*)~/g, COLORS.strikethrough("~$1~"))
    .replace(/_(.*)_/g, COLORS.italic("_$1_"))
    .replace(/\*(.*)\*/g, COLORS.italic("*$1*"));
}

function renderPriority(priority: TaskPriority): string {
  return COLORS[priority](priority);
}

function renderTimeTag(kind: string, time: Date) {
  return COLORS.tag(`@${kind}(${dateformat(time, "yy-mm-dd HH-MM")})`);
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
  return str + " ".repeat(size).slice(size);
}
