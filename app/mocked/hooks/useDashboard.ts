import { useCallback, useEffect, useState } from "react";
import { fetchDashboard } from "~/mocked/api/dashboard";
import type { DashboardData } from "~/mocked/types/dashboard";

type UseDashboardResult = {
  dashboard: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useDashboard(): UseDashboardResult {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      setDashboard(await fetchDashboard());
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
    dashboard,
    isLoading,
    error,
    refetch: fetchData,
  };
}
