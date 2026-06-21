import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getColumnLabel, getSortIcon } from "./getColumnLabel";

describe("getSortIcon", () => {
  it("returns null for an inactive column", () => {
    expect(getSortIcon({ column: "name", direction: "asc" }, "beruf")).toBeNull();
  });

  it("returns arrow-up when the column is sorted ascending", () => {
    expect(getSortIcon({ column: "name", direction: "asc" }, "name")).toBe(
      "arrow-up",
    );
  });

  it("returns arrow-down when the column is sorted descending", () => {
    expect(getSortIcon({ column: "name", direction: "desc" }, "name")).toBe(
      "arrow-down",
    );
  });
});

describe("getColumnLabel", () => {
  it("renders the label and calls onSort with the column on click", () => {
    const onSort = vi.fn();

    render(
      <>
        {getColumnLabel({
          column: "name",
          label: "Name",
          orderBy: { column: "vorname", direction: "asc" },
          onSort,
        })}
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(onSort).toHaveBeenCalledWith("name");
  });
});
