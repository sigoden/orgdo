import { ClockModel } from "../src/Clock";
import * as render from "../src/clock-render";
import * as fs from "fs";
import * as path from "path";

let clocks: ClockModel[];

(<any> process).TZ = "Asia/Shanghai";

beforeAll(() => {
  clocks = require("./fixtures/clocks.json");
});

test("render clocks", async () => {
  const ret = render.renderClocks(
    new Date("2018-09-10"),
    new Date("2018-10-14"),
    clocks
  );
  const expectRet = fs.readFileSync(
    path.resolve(__dirname, "./fixtures/clocks.txt"),
    "utf8"
  );
  expect(ret).toEqual(expectRet);
});
