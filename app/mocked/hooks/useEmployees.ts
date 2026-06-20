import { useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<EmployeeFilters | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const [employees, filters] = await Promise.all([
        fetchEmployees(),
        fetchEmployeeFilters(),
      ]);

      setEmployees(employees);
      setFilters(filters);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    employees,
    filters,
    isLoading,
    error,
    refetch: fetchData,
  };
}
