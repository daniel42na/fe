import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorState from "./ErrorState";

vi.mock("@zvoove/unity-ui", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Icon: ({ name }: { name: string }) => <span>{name}</span>,
  Stack: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Typography: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string | string[]) => (Array.isArray(key) ? key[0] : key),
  }),
}));

describe("ErrorState", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    consoleErrorSpy.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders fallback message and handles retry click", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorState onRetry={onRetry} />);

    expect(screen.getByText("error.unknown")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /error\.retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders specific message and logs error", () => {
    const onRetry = vi.fn();
    const error = new Error("error.network");

    render(<ErrorState onRetry={onRetry} error={error} />);

    expect(screen.getByText("error.network")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
  });
});
