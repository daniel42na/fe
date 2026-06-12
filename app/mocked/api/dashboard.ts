import { dashboardData } from "../data/dashboard";
import type { DashboardData } from "../types/dashboard";
import { mockFetch } from "./client";

export async function fetchDashboard(): Promise<DashboardData> {
  return mockFetch(dashboardData);
}
