import type { CommonIconNames } from "@zvoove/unity-ui";

export type DashboardKpi = {
  id: string;
  labelKey: string;
  value: string;
  change: string;
  changeColor: "green" | "yellow" | "steel-blue" | "error";
  icon: CommonIconNames;
};

export type DashboardActivity = {
  id: string;
  name: string;
  actionKey: string;
  timeKey: string;
};

export type DashboardUpcomingEvent = {
  id: string;
  titleKey: string;
  date: string;
  tagLabelKey: string;
  tagColor: "green" | "yellow" | "steel-blue" | "pink";
};

export type DashboardOnboardingStep = {
  labelKey: string;
  value: number;
};

export type DashboardData = {
  announcementKey: string;
  kpis: DashboardKpi[];
  activities: DashboardActivity[];
  upcomingEvents: DashboardUpcomingEvent[];
  onboardingProgress: DashboardOnboardingStep[];
};
