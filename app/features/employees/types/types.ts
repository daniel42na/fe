export type SortableColumnId =
  | "name"
  | "vorname"
  | "beruf"
  | "telefon"
  | "plz"
  | "eintritt"
  | "ueberlassen"
  | "status";

export type SortDirection = "asc" | "desc";

export type OrderBy = {
  column: SortableColumnId;
  direction: SortDirection;
};
