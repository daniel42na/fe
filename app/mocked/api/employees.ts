import { employeeFiltersData, employeesData } from "../data/employees";
import type { Employee, EmployeeFilters } from "../types/employee";
import { mockFetch } from "./client";

export async function fetchEmployees(): Promise<Employee[]> {
  return mockFetch(employeesData);
}

export async function fetchEmployeeFilters(): Promise<EmployeeFilters> {
  return mockFetch(employeeFiltersData);
}
