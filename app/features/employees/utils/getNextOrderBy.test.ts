import { describe, expect, it } from "vitest";
import { getNextOrderBy } from "./getNextOrderBy";

describe("getNextOrderBy", () => {
  it("sorts ascending when switching to a different column", () => {
    expect(getNextOrderBy({ column: "name", direction: "desc" }, "beruf")).toEqual(
      { column: "beruf", direction: "asc" },
    );
  });

  it("toggles ascending to descending on the active column", () => {
    expect(getNextOrderBy({ column: "name", direction: "asc" }, "name")).toEqual({
      column: "name",
      direction: "desc",
    });
  });

  it("toggles descending back to ascending on the active column", () => {
    expect(getNextOrderBy({ column: "name", direction: "desc" }, "name")).toEqual(
      { column: "name", direction: "asc" },
    );
  });
});
