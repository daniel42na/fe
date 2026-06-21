import { render, screen } from "@testing-library/react";
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

    render(<DashboardPage />);

    expect(screen.getByText("SkeletonMock")).toBeInTheDocument();
    expect(screen.queryByText("ErrorStateMock")).not.toBeInTheDocument();
    expect(screen.queryByText("DashboardPage")).not.toBeInTheDocument();
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

    render(<DashboardPage />);

    expect(screen.getByText("ErrorStateMock")).toBeInTheDocument();
    expect(errorStatePropsMock).toHaveBeenCalledWith({ error, onRetry: refetch });
    expect(screen.queryByText("SkeletonMock")).not.toBeInTheDocument();
    expect(screen.queryByText("DashboardPage")).not.toBeInTheDocument();
  });

  it("renders content when data is ready and no error", () => {
    useDashboardMock.mockReturnValue({
      dashboard: {
        announcementKey: "dashboard.announcement",
        kpis: [],
        activities: [],
        upcomingEvents: [],
        onboardingProgress: [],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByText("DashboardPage")).toBeInTheDocument();
    expect(screen.queryByText("SkeletonMock")).not.toBeInTheDocument();
    expect(screen.queryByText("ErrorStateMock")).not.toBeInTheDocument();
  });
});
