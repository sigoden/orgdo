declare module "timestring" {
  type Unit = "ms" | "s" | "m" | "h" | "d" | "w" | "mth" | "y";
  interface Options {
    hoursPerDay?: number;
    daysPerWeek?: number;
    weeksPerMonth?: number;
    monthsPerYear?: number;
    daysPerYear?: number;
  }
  type TimeString = (timestr: string, unit?: Unit, opts?: Options) => number;
  const timestring: TimeString;

  export = timestring;
}
