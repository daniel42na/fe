import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmployeesPage from "./EmployeesPage";

const useEmployeesMock = vi.fn();
const errorStatePropsMock = vi.fn();

vi.mock("~/mocked/hooks/useEmployees", () => ({
  useEmployees: () => useEmployeesMock(),
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

vi.mock("../components/EmployeesTable", () => ({
  EmployeesTable: () => <div>EmployeesTableMock</div>,
}));

describe("EmployeesPage", () => {
  beforeEach(() => {
    useEmployeesMock.mockReset();
    errorStatePropsMock.mockReset();
  });

  it("renders skeleton when loading", () => {
    useEmployeesMock.mockReturnValue({
      employees: [],
      filters: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<EmployeesPage />);

    expect(screen.getByText("SkeletonMock")).toBeInTheDocument();
    expect(screen.queryByText("ErrorStateMock")).not.toBeInTheDocument();
    expect(screen.queryByText("EmployeesTableMock")).not.toBeInTheDocument();
  });

  it("renders error state when error exists", () => {
    const error = new Error("boom");
    const refetch = vi.fn();

    useEmployeesMock.mockReturnValue({
      employees: [],
      filters: null,
      isLoading: false,
      error,
      refetch,
    });

    render(<EmployeesPage />);

    expect(screen.getByText("ErrorStateMock")).toBeInTheDocument();
    expect(errorStatePropsMock).toHaveBeenCalledWith({ error, onRetry: refetch });
    expect(screen.queryByText("SkeletonMock")).not.toBeInTheDocument();
    expect(screen.queryByText("EmployeesTableMock")).not.toBeInTheDocument();
  });

  it("renders the table when data is ready and no error", () => {
    useEmployeesMock.mockReturnValue({
      employees: [],
      filters: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<EmployeesPage />);

    expect(screen.getByText("EmployeesTableMock")).toBeInTheDocument();
    expect(screen.queryByText("SkeletonMock")).not.toBeInTheDocument();
    expect(screen.queryByText("ErrorStateMock")).not.toBeInTheDocument();
  });
});
