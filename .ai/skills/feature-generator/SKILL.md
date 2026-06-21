---
name: feature-generator
description: Scaffold a new feature (page + route + data layer + skeleton + error state + test) following the structure of `app/features/employees`. Use when asked to add a new page/feature/route, or to wire a screen to data. Generates missing types/data/api/hook as clearly commented stubs.
---

# Feature Generator

Create a new feature by mirroring the reference implementation in
`app/features/employees`. Always follow `.ai/RULES.md` (style, Unity UI,
i18n, structure). This skill only describes the _scaffolding_ — the page body
is filled in per the request.

## Reference: how `employees` is wired

`employees` is a prototype-level feature. Its only "content" is a placeholder
`<div>`, but the full plumbing around it is the pattern to copy:

```
app/features/employees/
  pages/
    EmployeesPage.tsx        # consumes the hook, renders Skeleton/ErrorState/content
    EmployeesPage.test.tsx   # vitest: loading / error / ready states
    index.ts                 # barrel: export { default as EmployeesPage }
  components/
    Skeleton/
      Skeleton.tsx           # feature loading state (Unity UI <Skeleton/>)
      index.ts               # barrel
app/routes/employees.tsx     # route module that renders <EmployeesPage/>
app/routes.ts                # ROUTES entry + route() registration
app/mocked/types/employee.ts # data model types
app/mocked/data/employees.ts # raw mock data
app/mocked/api/employees.ts  # fetch fns wrapping mockFetch()
app/mocked/hooks/useEmployees.ts # hook -> { <domain>, isLoading, error, refetch }
```

The page contract (copy this control flow exactly):

```tsx
function EmployeesPage() {
  const { employees, filters, isLoading, error, refetch } = useEmployees();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState onRetry={refetch} error={error} />;

  return <div>EmployeesPage</div>;
}

export default EmployeesPage;
```

## Naming conventions

- `<feature>` = lowercase singular folder/route/file segment (`employee`,
  `invoice`). `<feature-plural>` for collections where the codebase uses them
  (`employees`).
- `<Feature>` = PascalCase used in component/hook names (`EmployeesPage`,
  `useEmployees`).
- Page component: `<Feature>Page` (default export + barrel re-export).
- Hook: `use<Feature>` (named export), returning a **domain-named** data field
  (not a generic `data`), e.g. `{ employees, filters, ... }` or
  `{ dashboard, ... }`, plus `isLoading`, `error`, `refetch`.

## Stub policy (important)

For any piece that does **not** already exist (types, mock data, api, hook),
generate a minimal version with **simple fake data** and mark it explicitly:

- Add a top-of-file comment: `// stub: replace with real data/API`.
- Tag fake records/values inline with `// stub` where useful.
- Keep types real and accurate even when data is fake — downstream code relies
  on them.
- Never invent a backend call; route everything through `mockFetch` in
  `app/mocked/api/client.ts`.

## Steps

Work bottom-up (data layer first), creating only what is missing.

### 1. Types — `app/mocked/types/<feature>.ts`

```ts
// stub: refine to match the real data model when available
export type Widget = {
  id: string;
  name: string;
};

export type WidgetFilters = {
  category: { value: string; label: string }[];
};
```

### 2. Mock data — `app/mocked/data/<feature>.ts`

```ts
import type { Widget } from "../types/widget";

// stub: fake data for prototyping
export const widgetsData: Widget[] = [
  { id: "1", name: "Sample Widget" }, // stub
  { id: "2", name: "Another Widget" }, // stub
];
```

### 3. API — `app/mocked/api/<feature>.ts`

Always wrap data in `mockFetch` so the 300 ms async delay is simulated.

```ts
import { widgetsData } from "../data/widgets";
import type { Widget } from "../types/widget";
import { mockFetch } from "./client";

export async function fetchWidgets(): Promise<Widget[]> {
  return mockFetch(widgetsData);
}
```

### 4. Hook — `app/mocked/hooks/use<Feature>.ts`

Match the existing pattern: typed result, `useCallback` fetcher, `useEffect`
trigger, complete dependency arrays (`useExhaustiveDependencies` is enforced),
errors caught into state, `refetch` exposed.

```ts
import { useCallback, useEffect, useState } from "react";
import { fetchWidgets } from "~/mocked/api/widgets";
import type { Widget } from "~/mocked/types/widget";

type UseWidgetsResult = {
  widgets: Widget[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useWidgets(): UseWidgetsResult {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      setWidgets(await fetchWidgets());
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { widgets, isLoading, error, refetch: fetchData };
}
```

If a hook is requested but no data is meaningful yet, return a typed default
shape with a `// TODO: implement` comment, mirroring `useDashboard`.

### 5. Feature folder — `app/features/<feature>/`

**`components/Skeleton/Skeleton.tsx`** (+ `index.ts` barrel) — loading state
built from Unity UI:

```tsx
import { Skeleton as SkeletonComponent, Stack } from "@zvoove/unity-ui";

const Skeleton = () => (
  <Stack>
    <SkeletonComponent />
  </Stack>
);

export default Skeleton;
```

```ts
// index.ts
export { default as Skeleton } from "./Skeleton";
```

**`pages/<Feature>Page.tsx`** (+ `pages/index.ts` barrel) — consume the hook and
branch on loading/error/content. All user-facing text via `t()`; build content
from Unity UI components, not raw HTML.

```tsx
import { useWidgets } from "~/mocked/hooks/useWidgets";
import { ErrorState } from "~/components/ErrorState";
import { Skeleton } from "../components/Skeleton";

function WidgetsPage() {
  const { widgets, isLoading, error, refetch } = useWidgets();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState onRetry={refetch} error={error} />;

  return <div>WidgetsPage</div>; // stub: replace with Unity UI content
}

export default WidgetsPage;
```

```ts
// pages/index.ts
export { default as WidgetsPage } from "./WidgetsPage";
```

### 6. Route module — `app/routes/<feature>.tsx`

```tsx
import { WidgetsPage } from "../features/widgets/pages";

export default function Widgets() {
  return <WidgetsPage />;
}
```

### 7. Register the route — `app/routes.ts`

Add the path to `ROUTES` and the `route()` entry inside the `app-layout` block:

```ts
export const ROUTES = {
  home: "/",
  employees: "/employees",
  widgets: "/widgets", // new
} as const;

// ...inside layout("routes/app-layout.tsx", [ ... ]):
route(ROUTES.widgets, "routes/widgets.tsx"),
```

### 8. Navigation + i18n (when the feature is user-reachable)

- Add a `menuItems` entry and breadcrumb case in
  `app/components/Layout/Layout.tsx` using a typed Unity UI icon name and a
  `nav.<feature>` translation key.
- Add every new key to **both** `app/i18n/locales/de.json` and `en.json`,
  preserving the nested, `camelCase` structure.

### 9. Test — `pages/<Feature>Page.test.tsx`

Co-locate a Vitest + Testing Library test covering loading, error, and ready
states. Mock the hook and the `Skeleton`/`ErrorState` collaborators so the page
is tested in isolation (see `EmployeesPage.test.tsx`).

```tsx
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WidgetsPage from "./WidgetsPage";

const useWidgetsMock = vi.fn();

vi.mock("~/mocked/hooks/useWidgets", () => ({
  useWidgets: () => useWidgetsMock(),
}));
vi.mock("~/components/ErrorState", () => ({
  ErrorState: () => <div>ErrorStateMock</div>,
}));
vi.mock("../components/Skeleton", () => ({
  Skeleton: () => <div>SkeletonMock</div>,
}));

describe("WidgetsPage", () => {
  beforeEach(() => useWidgetsMock.mockReset());

  it("renders skeleton when loading", () => {
    useWidgetsMock.mockReturnValue({
      widgets: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<WidgetsPage />);
    expect(screen.getByText("SkeletonMock")).toBeInTheDocument();
  });

  it("renders error state when error exists", () => {
    useWidgetsMock.mockReturnValue({
      widgets: [],
      isLoading: false,
      error: new Error("boom"),
      refetch: vi.fn(),
    });
    render(<WidgetsPage />);
    expect(screen.getByText("ErrorStateMock")).toBeInTheDocument();
  });

  it("renders content when ready", () => {
    useWidgetsMock.mockReturnValue({
      widgets: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<WidgetsPage />);
    expect(screen.getByText("WidgetsPage")).toBeInTheDocument();
  });
});
```

## Definition of done

- All missing data-layer pieces created as clearly-commented **stubs**; types are
  accurate even when data is fake.
- Page renders Skeleton (loading), ErrorState (error), and content paths.
- Route registered in `routes.ts`; nav/breadcrumbs + i18n keys added in both
  locales when user-reachable.
- Co-located test covers the three states.
- `pnpm check`, `pnpm typecheck`, and `pnpm test` all pass.
