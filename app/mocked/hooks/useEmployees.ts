import { useCallback, useEffect, useState } from "react";
import type { Employee, EmployeeFilters } from "~/mocked/types/employee";
import { fetchEmployees, fetchEmployeeFilters } from "~/mocked/api/employees";

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

      const [nextEmployees, nextFilters] = await Promise.all([
        fetchEmployees(),
        fetchEmployeeFilters(),
      ]);

      setEmployees(nextEmployees);
      setFilters(nextFilters);
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
