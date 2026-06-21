import { describe, expect, it } from "vitest";
import { parseDate } from "./parseDate";

describe("parseDate", () => {
  it("parses a valid dd.mm.yyyy date into a timestamp", () => {
    expect(parseDate("26.12.2025")).toBe(new Date(2025, 11, 26).getTime());
  });

  it("orders earlier dates before later ones", () => {
    expect(parseDate("01.01.2024")).toBeLessThan(parseDate("01.01.2025"));
    expect(parseDate("13.03.2031")).toBeGreaterThan(parseDate("30.04.2027"));
  });

  it("returns NaN for an empty string", () => {
    expect(parseDate("")).toBeNaN();
  });

  it("returns NaN when parts are missing", () => {
    expect(parseDate("2025")).toBeNaN();
    expect(parseDate("12.2025")).toBeNaN();
  });

  it("returns NaN for non-numeric parts", () => {
    expect(parseDate("aa.bb.cccc")).toBeNaN();
  });
});
