import { useCallback, useEffect, useState } from "react";
import { fetchEmployeeFilters, fetchEmployees } from "~/mocked/api/employees";
import type { Employee, EmployeeFilters } from "~/mocked/types/employee";

type UseEmployeesResult = {
  employees: Employee[];
  filters: EmployeeFilters | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useEmployees(): UseEmployeesResult {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<EmployeeFilters | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const [employees, filters] = await Promise.all([
        fetchEmployees(),
        fetchEmployeeFilters(),
      ]);

      setEmployees(employees);
      setFilters(filters);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    employees,
    filters,
    isLoading,
    error,
    refetch: fetchData,
  };
}
