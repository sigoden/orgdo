import * as _ from "lodash";

const RE_RDAYS = /^([\-><])?\d+$/;
const DAY_MS = 86400000;

import Task from "./Task";

type DateFilter = (date: any) => boolean;
type StringArrayFilter = (tags: string[]) => boolean;
type ValueFilter = (value: string) => boolean;

export type TaskFilter = (task: Task) => boolean;

export function newTimerFilter(daystr: string): DateFilter {
  daystr = _.trim(daystr);
  if (!RE_RDAYS.test(daystr)) {
    throw Error("Invalid daystr");
  }
  const mark = daystr[0];
  switch (mark) {
    case ">": // n days later
      return date => {
        const time = date.getTime();
        const now = Date.now();
        return time > now + DAY_MS * parseFloat(daystr.slice(1));
      };
    case "-": // 3 days ago
      return date => {
        const time = date.getTime();
        const now = Date.now();
        return time > now - DAY_MS * parseFloat(daystr.slice(1)) && time <= now;
      };
    case "<": // At least 3 days ago
      return date => {
        const time = date.getTime();
        const now = Date.now();
        return time < now - DAY_MS * parseFloat(daystr.slice(1));
      };
    default:
      // within n days
      return date => {
        const time = date.getTime();
        const now = Date.now();
        return time > now && time < now + DAY_MS * parseFloat(daystr);
      };
  }
}
export function newTagsFilter(tagsGroup: string[]): StringArrayFilter {
  return (tags: string[]) => {
    for (const tagstr of tagsGroup) {
      if (!tagstr.split(",").some(tag => tags.indexOf(tag) > -1)) {
        return false;
      }
    }
    return true;
  };
}

export function newRegexpFilter(regexp: string): ValueFilter {
  return (value: string) => new RegExp(regexp).test(value);
}

export function newEqualAnyFilter(matches: string | string[]): ValueFilter {
  return (value: string) => {
    let matchesArr: string[];
    if (typeof matches === "string") {
      matchesArr = [matches];
    } else {
      matchesArr = matches;
    }
    return Boolean(matchesArr.find(v => v === value));
  };
}

export function combine(filters: TaskFilter[]): TaskFilter {
  return task => {
    for (const f of filters) {
      if (!f(task)) {
        return false;
      }
    }
    return true;
  };
}
