import { useCallback, useMemo, useState } from "react";
import type {
  Employee,
  EmployeeFilterOption,
  EmployeeFilters,
} from "~/mocked/types/employee";

export type EmployeeFilterKey = keyof EmployeeFilters;

export const FILTER_KEYS: EmployeeFilterKey[] = [
  "beruf",
  "plz",
  "eintritt",
  "ueberlassen",
  "status",
];

export type SelectedFilters = Record<EmployeeFilterKey, string[]>;

const EMPTY_SELECTION: SelectedFilters = {
  beruf: [],
  plz: [],
  eintritt: [],
  ueberlassen: [],
  status: [],
};

const yearOf = (date: string) => date.split(".").at(-1) ?? "";

// beruf matches the employee field by label,
// the date facets by year, the rest by raw value.
const optionMatchers: Record<
  EmployeeFilterKey,
  (employee: Employee, option: EmployeeFilterOption) => boolean
> = {
  beruf: (employee, option) => employee.beruf === option.label,
  plz: (employee, option) => employee.plz === option.value,
  eintritt: (employee, option) => yearOf(employee.eintritt) === option.value,
  ueberlassen: (employee, option) =>
    yearOf(employee.ueberlassen) === option.value,
  status: (employee, option) => employee.status === option.value,
};

type UseEmployeeFiltersResult = {
  search: string;
  setSearch: (value: string) => void;
  selected: SelectedFilters;
  toggleFilter: (key: EmployeeFilterKey, value: string) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  filteredEmployees: Employee[];
};

export function useEmployeeFilters(
  employees: Employee[],
  filters: EmployeeFilters | null,
): UseEmployeeFiltersResult {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SelectedFilters>(EMPTY_SELECTION);

  const toggleFilter = useCallback((key: EmployeeFilterKey, value: string) => {
    setSelected((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelected(EMPTY_SELECTION);
  }, []);

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    return employees.filter((employee) => {
      if (term) {
        const haystack =
          `${employee.vorname} ${employee.nachname}`.toLowerCase();
        if (!haystack.includes(term)) {
          return false;
        }
      }

      // AND across categories, OR within a single category.
      for (const key of FILTER_KEYS) {
        const values = selected[key];
        if (values.length === 0) {
          continue;
        }

        const options = (filters?.[key] ?? []).filter((option) =>
          values.includes(option.value),
        );
        const matches = options.some((option) =>
          optionMatchers[key](employee, option),
        );
        if (!matches) {
          return false;
        }
      }

      return true;
    });
  }, [employees, filters, search, selected]);

  const activeFilterCount = useMemo(
    () => FILTER_KEYS.reduce((sum, key) => sum + selected[key].length, 0),
    [selected],
  );

  return {
    search,
    setSearch,
    selected,
    toggleFilter,
    clearFilters,
    activeFilterCount,
    filteredEmployees,
  };
}
