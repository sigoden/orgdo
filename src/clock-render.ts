import { ClockModel } from "./Clock";
import { clearTimeInfo } from "./utits";
import chalk from "chalk";
import * as os from "os";

const MARK = chalk.bold;

export function renderClocks(start: Date, end: Date, clocks: ClockModel[]) {
  start = clearTimeInfo(start);
  end = clearTimeInfo(end);
  const begin = firstOfWeek(start);
  const weekNum = calWeeksNum(begin, end);
  const aggArr = aggregateClocks(begin, weekNum, clocks);
  const lines = ["Sun Mon Tue Wed Thu Fri Sat"];
  const indexOfStart = dayOffset(begin, start);
  const indexOfEnd = dayOffset(begin, end);
  let line = "";
  aggArr.forEach((v, i) => {
    const isSun = i % 7 === 0;
    const isEmpty = i < indexOfStart || i > indexOfEnd;
    let value = paddingRight(isEmpty ? "" : String(v), isSun ? 3 : 4);
    if (i === indexOfStart || i === indexOfEnd) {
      value = MARK(value);
    }
    line += value;
    if ((i + 1) % 7 === 0) {
      lines.push(line);
      line = "";
    }
  });
  return lines.join(os.EOL);
}

function aggregateClocks(begin: Date, weekNum: number, clocks: ClockModel[]) {
  const ret = Array.from(" ".repeat(7 * weekNum)).map(v => 0);
  clocks.map(clock => {
    const offset = dayOffset(begin, clearTimeInfo(clock.createdAt));
    ret[offset]++;
  });
  return ret;
}

function firstOfWeek(date: Date) {
  const ret = new Date(date.getTime());
  ret.setDate(ret.getDate() - ret.getDay());
  return ret;
}

function calWeeksNum(begin: Date, target: Date) {
  return Math.ceil((dayOffset(begin, target) + 1) / 7);
}

function dayOffset(begin: Date, target: Date) {
  return Math.floor((target.getTime() - begin.getTime()) / 86400000);
}

function paddingRight(str: string, size: number) {
  return (" ".repeat(size) + str).slice(-1 * size);
}
