import type { DashboardData } from "../types/dashboard";

export const dashboardData: DashboardData = {
  announcementKey: "dashboard.announcement",
  kpis: [
    {
      id: "employees",
      labelKey: "dashboard.kpis.employees",
      value: "247",
      change: "+12",
      changeColor: "green",
      icon: "users",
    },
    {
      id: "positions",
      labelKey: "dashboard.kpis.positions",
      value: "12",
      change: "+3",
      changeColor: "steel-blue",
      icon: "job",
    },
    {
      id: "onboarding",
      labelKey: "dashboard.kpis.onboarding",
      value: "8",
      change: "2",
      changeColor: "yellow",
      icon: "user-account",
    },
    {
      id: "leave",
      labelKey: "dashboard.kpis.leave",
      value: "5",
      change: "1",
      changeColor: "error",
      icon: "vacation",
    },
  ],
  activities: [
    {
      id: "1",
      name: "Alex Buckmaster",
      actionKey: "dashboard.activity.signedContract",
      timeKey: "dashboard.time.hoursAgo",
    },
    {
      id: "2",
      name: "Ghaith Abaza",
      actionKey: "dashboard.activity.completedOnboarding",
      timeKey: "dashboard.time.yesterday",
    },
    {
      id: "3",
      name: "Jonas Abt",
      actionKey: "dashboard.activity.submittedLeave",
      timeKey: "dashboard.time.daysAgo",
    },
    {
      id: "4",
      name: "Sarah Klein",
      actionKey: "dashboard.activity.newApplication",
      timeKey: "dashboard.time.hoursAgo2",
    },
  ],
  upcomingEvents: [
    {
      id: "1",
      titleKey: "dashboard.upcoming.interview",
      date: "12.06.2026",
      tagLabelKey: "dashboard.tags.recruiting",
      tagColor: "steel-blue",
    },
    {
      id: "2",
      titleKey: "dashboard.upcoming.probationEnd",
      date: "18.06.2026",
      tagLabelKey: "dashboard.tags.hr",
      tagColor: "yellow",
    },
    {
      id: "3",
      titleKey: "dashboard.upcoming.teamMeeting",
      date: "20.06.2026",
      tagLabelKey: "dashboard.tags.team",
      tagColor: "green",
    },
    {
      id: "4",
      titleKey: "dashboard.upcoming.training",
      date: "25.06.2026",
      tagLabelKey: "dashboard.tags.learning",
      tagColor: "pink",
    },
  ],
  onboardingProgress: [
    { labelKey: "dashboard.onboarding.documents", value: 75 },
    { labelKey: "dashboard.onboarding.training", value: 40 },
  ],
};
