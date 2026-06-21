import {
  Avatar,
  Button,
  PopUpMenu,
  Stack,
  Table,
  type TableColumnProps,
  Tag,
  type TagProps,
  Typography,
} from "@zvoove/unity-ui";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type {
  Employee,
  EmployeeFilters,
  EmployeeStatus,
} from "~/mocked/types/employee";
import { useEmployeeFilters } from "../../hooks/useEmployeeFilters";
import type { OrderBy, SortableColumnId } from "../../types/types";
import { getColumnLabel, getNextOrderBy, parseDate } from "../../utils";
import { FilterControls } from "../FilterControls";

type Props = {
  employees: Employee[];
  filters: EmployeeFilters | null;
};

const STATUS_COLOR: Record<EmployeeStatus, TagProps["color"]> = {
  mitarbeiter: "green",
  bewerber: "steel-blue",
  ehemalig: "neutral",
  zukuenftig: "yellow",
  "bewerber-cockpit": "pink",
};

const SORTABLE_COLUMNS: SortableColumnId[] = [
  "name",
  "vorname",
  "beruf",
  "telefon",
  "plz",
  "eintritt",
  "ueberlassen",
  "status",
];

const DEFAULT_ORDER_BY: OrderBy = {
  column: "name",
  direction: "asc",
};

type EmployeeColumnId =
  | "name"
  | "vorname"
  | "beruf"
  | "telefon"
  | "plz"
  | "eintritt"
  | "ueberlassen"
  | "status"
  | "aktionen";

const HIDEABLE_COLUMNS: EmployeeColumnId[] = [
  "beruf",
  "telefon",
  "plz",
  "eintritt",
  "ueberlassen",
  "status",
  "aktionen",
];

const EmployeesTable = ({ employees, filters }: Props) => {
  const { t } = useTranslation();
  const [orderBy, setOrderBy] = useState(DEFAULT_ORDER_BY);
  const [hiddenColumns, setHiddenColumns] = useState<EmployeeColumnId[]>([]);
  const { search, setSearch, selected, toggleFilter, filteredEmployees } =
    useEmployeeFilters(employees, filters);

  const handleRowAction = useCallback(
    (_employee: Employee, _action: string) => {
      //TODO: wire row actions to real handlers
    },
    [],
  );

  const handleColumnSort = useCallback((column: SortableColumnId) => {
    setOrderBy((prev) => getNextOrderBy(prev, column));
  }, []);

  const renderColumnLabel = useCallback(
    (column: SortableColumnId, label: string) =>
      getColumnLabel({ column, label, orderBy, onSort: handleColumnSort }),
    [handleColumnSort, orderBy],
  );

  const allColumns = useMemo<TableColumnProps[]>(
    () => [
      {
        id: "name",
        label: renderColumnLabel("name", t("employees.columns.name")),
      },
      {
        id: "vorname",
        label: renderColumnLabel("vorname", t("employees.columns.vorname")),
      },
      {
        id: "beruf",
        label: renderColumnLabel("beruf", t("employees.columns.beruf")),
      },
      {
        id: "telefon",
        label: renderColumnLabel("telefon", t("employees.columns.telefon")),
      },
      {
        id: "plz",
        label: renderColumnLabel("plz", t("employees.columns.plz")),
      },
      {
        id: "eintritt",
        label: renderColumnLabel("eintritt", t("employees.columns.eintritt")),
      },
      {
        id: "ueberlassen",
        label: renderColumnLabel(
          "ueberlassen",
          t("employees.columns.ueberlassen"),
        ),
      },
      {
        id: "status",
        label: renderColumnLabel("status", t("employees.columns.status")),
      },
      {
        id: "aktionen",
        label: t("employees.columns.aktionen"),
        align: "right",
      },
    ],
    [renderColumnLabel, t],
  );

  const handleToggleColumnVisibility = useCallback((columnId: string) => {
    if (!HIDEABLE_COLUMNS.includes(columnId as EmployeeColumnId)) {
      return;
    }

    setHiddenColumns((prev) =>
      prev.includes(columnId as EmployeeColumnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId as EmployeeColumnId],
    );
  }, []);

  const sortedEmployees = useMemo(() => {
    if (!SORTABLE_COLUMNS.includes(orderBy.column)) {
      return filteredEmployees;
    }

    const direction = orderBy.direction === "asc" ? 1 : -1;

    return [...filteredEmployees].sort((a, b) => {
      let compare = 0;

      switch (orderBy.column) {
        case "name":
          compare = a.nachname.localeCompare(b.nachname);
          break;
        case "vorname":
          compare = a.vorname.localeCompare(b.vorname);
          break;
        case "beruf":
          compare = a.beruf.localeCompare(b.beruf);
          break;
        case "telefon":
          compare = a.telefon.localeCompare(b.telefon);
          break;
        case "plz":
          compare = a.plz.localeCompare(b.plz);
          break;
        case "eintritt":
          compare = parseDate(a.eintritt) - parseDate(b.eintritt);
          break;
        case "ueberlassen":
          compare = parseDate(a.ueberlassen) - parseDate(b.ueberlassen);
          break;
        case "status":
          compare = a.status.localeCompare(b.status);
          break;
        default:
          compare = 0;
      }

      return compare * direction;
    });
  }, [filteredEmployees, orderBy]);

  const data = useMemo(
    () =>
      sortedEmployees.map((employee) => ({
        name: (
          <Stack direction="row" gap="sm" align="center">
            <Avatar
              size="sm"
              type={employee.image ? "image" : "initials"}
              image={employee.image}
              name={`${employee.vorname} ${employee.nachname}`}
            />
            <Typography as="span">{employee.nachname}</Typography>
          </Stack>
        ),
        vorname: employee.vorname,
        beruf: employee.beruf,
        telefon: employee.telefon,
        plz: employee.plz,
        eintritt: employee.eintritt,
        ueberlassen: employee.ueberlassen,
        status: (
          <Tag
            label={t(`employees.status.${employee.status}`)}
            color={STATUS_COLOR[employee.status]}
            variant="solid"
            tone="light"
            size="sm"
          />
        ),
        aktionen: (
          <Stack direction="row" justify="flex-end" width="100%">
            <PopUpMenu
              placement="bottom-right"
              items={[
                {
                  id: "view",
                  label: t("employees.actions.view"),
                  icon: "show",
                  onClick: () => handleRowAction(employee, "view"),
                },
                {
                  id: "edit",
                  label: t("employees.actions.edit"),
                  icon: "edit",
                  onClick: () => handleRowAction(employee, "edit"),
                },
                {
                  id: "delete",
                  label: t("employees.actions.delete"),
                  icon: "delete",
                  onClick: () => handleRowAction(employee, "delete"),
                },
              ]}
            >
              <Button
                variant="text"
                icon="more-vertical"
                hideLabel
                aria-label={t("employees.columns.aktionen")}
              />
            </PopUpMenu>
          </Stack>
        ),
      })),
    [handleRowAction, sortedEmployees, t],
  );

  return (
    <Stack direction="column" gap="md" width="100%">
      <Table
        columns={allColumns}
        data={data}
        hiddenColumns={hiddenColumns}
        title={`${t("employees.title")} (${filteredEmployees.length})`}
        actions={
          <PopUpMenu
            selectable="multiple"
            selectedItem={HIDEABLE_COLUMNS.filter(
              (columnId) => !hiddenColumns.includes(columnId),
            )}
            onItemClick={(item) => handleToggleColumnVisibility(item.id)}
            items={HIDEABLE_COLUMNS.map((columnId) => ({
              id: columnId,
              label: t(`employees.columns.${columnId}`),
              keepOpen: true,
            }))}
            density="-4"
            placement="bottom-right"
          >
            <Button variant="text" icon="columns"/>
          </PopUpMenu>
        }
        filters={
          <FilterControls
            search={search}
            onSearchChange={setSearch}
            selected={selected}
            onToggleFilter={toggleFilter}
            filters={filters}
          />
        }
        emptyState={t("employees.empty")}
      />
    </Stack>
  );
};

export default EmployeesTable;
