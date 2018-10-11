import * as _ from "lodash";

const RE_RDAYS = /^>?-?\d+$/;
const DAY_MS = 86400000;

import Task from "./Task";

type TimeFilter = (date: Date) => boolean;
type TagsFilter = (tags: string[]) => boolean;
type RegexpFilter = (value: string) => boolean;

export type TaskFilter = (task: Task) => boolean;

export function newTimerFilter(daystr: string): TimeFilter {
  daystr = _.trim(daystr);
  if (!RE_RDAYS.test(daystr)) {
    throw Error("Invalid daystr");
  }
  if (daystr[0] === ">") {
    if (daystr[1] === "-") {
      return date => {
        const time = date.getTime();
        const now = Date.now();
        return (
          time > now - DAY_MS * parseInt(daystr.slice(2), 10) && time <= now
        );
      };
    } else {
      return date => {
        const time = date.getTime();
        const now = Date.now();
        return time > now + DAY_MS * parseInt(daystr.slice(1), 10);
      };
    }
  } else if (daystr[0] === "-") {
    return date => {
      const time = date.getTime();
      const now = Date.now();
      return time < now - DAY_MS * parseInt(daystr.slice(1), 10);
    };
  } else {
    return date => {
      const time = date.getTime();
      const now = Date.now();
      return time > now && time < now + DAY_MS * parseInt(daystr, 10);
    };
  }
}
export function newTagsFilter(tagsGroup: string[]): TagsFilter {
  return (tags: string[]) => {
    for (const tagstr of tagsGroup) {
      if (!tagstr.split(",").some(tag => tags.indexOf(tag) > -1)) {
        return false;
      }
    }
    return true;
  };
}

export function newRegexpFilter(regexp: string): RegexpFilter {
  return (value: string) => new RegExp(regexp).test(value);
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
