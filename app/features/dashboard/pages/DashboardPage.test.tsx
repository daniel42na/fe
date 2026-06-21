import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./DashboardPage";

const useDashboardMock = vi.fn();
const errorStatePropsMock = vi.fn();

vi.mock("~/mocked/hooks/useDashboard", () => ({
  useDashboard: () => useDashboardMock(),
}));

vi.mock("~/components/ErrorState", () => ({
  ErrorState: (props: unknown) => {
    errorStatePropsMock(props);
    return <div>ErrorStateMock</div>;
  },
}));

vi.mock("../components/Skeleton", () => ({
  Skeleton: () => <div>SkeletonMock</div>,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );

describe("DashboardPage", () => {
  beforeEach(() => {
    useDashboardMock.mockReset();
    errorStatePropsMock.mockReset();
  });

  it("renders skeleton when loading", () => {
    useDashboardMock.mockReturnValue({
      dashboard: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText("SkeletonMock")).toBeInTheDocument();
    expect(screen.queryByText("ErrorStateMock")).not.toBeInTheDocument();
    expect(screen.queryByText("dashboard.page.title")).not.toBeInTheDocument();
  });

  it("renders error state when error exists", () => {
    const error = new Error("boom");
    const refetch = vi.fn();

    useDashboardMock.mockReturnValue({
      dashboard: null,
      isLoading: false,
      error,
      refetch,
    });

    renderPage();

    expect(screen.getByText("ErrorStateMock")).toBeInTheDocument();
    expect(errorStatePropsMock).toHaveBeenCalledWith({ error, onRetry: refetch });
    expect(screen.queryByText("SkeletonMock")).not.toBeInTheDocument();
  });

  it("renders the header and KPI cards when data is ready", () => {
    useDashboardMock.mockReturnValue({
      dashboard: {
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
        ],
        activities: [],
        upcomingEvents: [],
        onboardingProgress: [],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText("dashboard.page.title")).toBeInTheDocument();
    expect(screen.getByText("247")).toBeInTheDocument();
    expect(screen.getByText("+12")).toBeInTheDocument();
    expect(screen.queryByText("SkeletonMock")).not.toBeInTheDocument();
    expect(screen.queryByText("ErrorStateMock")).not.toBeInTheDocument();
  });
});
