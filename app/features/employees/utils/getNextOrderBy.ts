import type { OrderBy, SortableColumnId } from "../types/types";

// Computes the next sort state when a column header is clicked: a new column
// starts ascending, the active column toggles between ascending and descending.
export const getNextOrderBy = (
  current: OrderBy,
  column: SortableColumnId,
): OrderBy => {
  if (current.column !== column) {
    return { column, direction: "asc" };
  }

  return {
    column,
    direction: current.direction === "asc" ? "desc" : "asc",
  };
};
