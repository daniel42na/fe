import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Employee, EmployeeFilters } from "~/mocked/types/employee";
import { useEmployeeFilters } from "./useEmployeeFilters";

const employees: Employee[] = [
  {
    id: "1",
    nachname: "Buckmaster",
    vorname: "Alex",
    beruf: "Staplerfahrer/in",
    telefon: "0171 1",
    plz: "89765",
    eintritt: "26.12.2025",
    ueberlassen: "13.03.2031",
    status: "mitarbeiter",
  },
  {
    id: "2",
    nachname: "Abazi",
    vorname: "Driton",
    beruf: "Elektriker/in",
    telefon: "0171 2",
    plz: "45678",
    eintritt: "01.01.2024",
    ueberlassen: "30.04.2027",
    status: "bewerber",
  },
];

const filters: EmployeeFilters = {
  beruf: [
    { value: "stapler", label: "Staplerfahrer/in" },
    { value: "elektriker", label: "Elektriker/in" },
  ],
  plz: [
    { value: "89765", label: "89765" },
    { value: "45678", label: "45678" },
  ],
  eintritt: [
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
  ],
  ueberlassen: [
    { value: "2027", label: "2027" },
    { value: "2031", label: "2031" },
  ],
  status: [
    { value: "mitarbeiter", label: "Mitarbeiter" },
    { value: "bewerber", label: "Bewerber" },
  ],
};

const ids = (list: Employee[]) => list.map((employee) => employee.id);

describe("useEmployeeFilters", () => {
  it("returns all employees with no search or filters", () => {
    const { result } = renderHook(() => useEmployeeFilters(employees, filters));
    expect(ids(result.current.filteredEmployees)).toEqual(["1", "2"]);
  });

  it("searches by vorname and nachname case-insensitively", () => {
    const { result } = renderHook(() => useEmployeeFilters(employees, filters));

    act(() => result.current.setSearch("ALEX"));
    expect(ids(result.current.filteredEmployees)).toEqual(["1"]);

    act(() => result.current.setSearch("abaz"));
    expect(ids(result.current.filteredEmployees)).toEqual(["2"]);
  });

  it("filters status by value", () => {
    const { result } = renderHook(() => useEmployeeFilters(employees, filters));

    act(() => result.current.toggleFilter("status", "mitarbeiter"));
    expect(ids(result.current.filteredEmployees)).toEqual(["1"]);
  });

  it("filters beruf by option label", () => {
    const { result } = renderHook(() => useEmployeeFilters(employees, filters));

    act(() => result.current.toggleFilter("beruf", "elektriker"));
    expect(ids(result.current.filteredEmployees)).toEqual(["2"]);
  });

  it("filters date facets by year", () => {
    const { result } = renderHook(() => useEmployeeFilters(employees, filters));

    act(() => result.current.toggleFilter("eintritt", "2024"));
    expect(ids(result.current.filteredEmployees)).toEqual(["2"]);
  });

  it("combines multiple categories with AND logic", () => {
    const { result } = renderHook(() => useEmployeeFilters(employees, filters));

    act(() => result.current.toggleFilter("status", "mitarbeiter"));
    act(() => result.current.toggleFilter("plz", "45678"));
    expect(result.current.filteredEmployees).toHaveLength(0);
  });

  it("toggles a filter off when selected twice", () => {
    const { result } = renderHook(() => useEmployeeFilters(employees, filters));

    act(() => result.current.toggleFilter("status", "mitarbeiter"));
    expect(result.current.activeFilterCount).toBe(1);

    act(() => result.current.toggleFilter("status", "mitarbeiter"));
    expect(result.current.activeFilterCount).toBe(0);
    expect(ids(result.current.filteredEmployees)).toEqual(["1", "2"]);
  });
});
