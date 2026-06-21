import { Icon, Typography } from "@zvoove/unity-ui";
import type { ReactNode } from "react";
import type { OrderBy, SortableColumnId } from "../types/types";

// Resolves the sort indicator icon for a column, or null when it is inactive.
export const getSortIcon = (
  orderBy: OrderBy,
  column: SortableColumnId,
): "arrow-up" | "arrow-down" | null => {
  if (orderBy.column !== column) {
    return null;
  }

  return orderBy.direction === "asc" ? "arrow-up" : "arrow-down";
};

type ColumnLabelParams = {
  column: SortableColumnId;
  label: string;
  orderBy: OrderBy;
  onSort: (column: SortableColumnId) => void;
};

// Renders a clickable, sortable table column header with its sort indicator.
export const getColumnLabel = ({
  column,
  label,
  orderBy,
  onSort,
}: ColumnLabelParams): ReactNode => {
  const iconName = getSortIcon(orderBy, column);

  return (
    <button
      type="button"
      className="inline-flex items-center gap-xs cursor-pointer"
      onClick={() => onSort(column)}
    >
      <Typography as="span">{label}</Typography>
      {iconName ? <Icon name={iconName} size="sm" /> : null}
    </button>
  );
};
