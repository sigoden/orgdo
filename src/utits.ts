export function paddingLeft(str: string, size: number) {
  return (str + " ".repeat(size)).slice(0, size);
}

export function prependZero(str: string, size: number) {
  return ("0".repeat(size) + str).slice(-1 * size);
}

export function paddingRight(str: string, size: number) {
  return (" ".repeat(size) + str).slice(-1 * size);
}

export function dateFormat(date: Date): string {
  const year = "" + date.getFullYear();
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

export function shortTimeStr(timestr: string): string {
  const date = new Date(timestr);
  const now = new Date();
  if (date.getFullYear() === now.getFullYear()) {
    timestr = timestr.slice(5);
  } else {
    return timestr.slice(2);
  }
  if (date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) {
    return timestr.slice(6);
  }
  return timestr;
}

export function clearTimeInfo(date: Date) {
  const ret = new Date(date.toString());
  ret.setHours(0);
  ret.setMinutes(0);
  ret.setSeconds(0);
  ret.setMilliseconds(0);
  return ret;
}

export function strToArr(obj: any, key: string) {
  if (obj[key] && typeof obj[key] === "string") {
    obj[key] = [obj[key]];
  }
}
