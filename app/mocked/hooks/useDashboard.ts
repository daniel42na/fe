import type { DashboardData } from "../types/dashboard";

type UseDashboardResult = {
  dashboard: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useDashboard(): UseDashboardResult {
  // TODO: Implement the useDashboard hook

  return {
    dashboard: null,
    isLoading: false,
    error: null,
    refetch: () => {},
  };
}
