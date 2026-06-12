# PDL Frontend Code Challenge

## Context

You are building two pages for an HR tech platform. The application uses **React Router v7**, **TypeScript**, and **[@zvoove/unity-ui](https://dub.sh/unity-ui)** as its component library. A deployed reference of the finished result is available so you can see exactly what to aim for:

> **Live reference:** <!-- REPLACE_WITH_DEPLOYED_URL -->

Use the reference as a visual guide. Your implementation does not need to be pixel-perfect, but it should be functionally equivalent and follow the same layout structure.

## Getting Started

```bash
# Requires Node 24 (see .nvmrc)
nvm use

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

The app runs at `http://localhost:5173`. Two routes are pre-configured but their pages are empty — that is where your work begins.

## What Is Already Provided

You do **not** need to build or modify any of the following. They are ready to use:

| Area                | Location                 | Description                                                                                                                                                  |
| ------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App shell / Layout  | `app/components/Layout/` | Side navigation, breadcrumbs, top bar, theme toggle, language switch                                                                                         |
| Routing             | `app/routes.ts`          | Two routes wired: `/` (home) and `/employees`                                                                                                                |
| i18n                | `app/i18n/`              | Full i18n setup with `react-i18next`. Locale files (`de.json`, `en.json`) already contain every translation key you need. Use `t("key")` in your components. |
| Mock API            | `app/mocked/api/`        | Async functions that simulate API calls with a 300ms delay: `fetchDashboard()`, `fetchEmployees()`, `fetchEmployeeFilters()`                                 |
| React Hooks (stubs) | `app/mocked/hooks/`      | `useDashboard()` and `useEmployees()` — **stubbed out** with correct types and return shape. You must implement them (see Task 0 below).                     |
| Types               | `app/mocked/types/`      | Full TypeScript types for all data models (`Employee`, `DashboardData`, etc.)                                                                                |
| Mock data           | `app/mocked/data/`       | 12 employees, dashboard KPIs, activities, upcoming events, onboarding progress, and filter option lists                                                      |
| Unity UI            | `@zvoove/unity-ui`       | Already installed and configured. Component documentation is available at [dub.sh/unity-ui](https://dub.sh/unity-ui).                                        |

### Key hooks you will use

```typescript
// Dashboard page
const { dashboard, isLoading, error, refetch } = useDashboard();

// Employees page
const { employees, filters, isLoading, error, refetch } = useEmployees();
```

> **Note:** These hooks are provided as **stubs only** — they return empty/default values. Implementing them is part of the challenge (see Task 0).

### Project structure

```
app/
├── components/Layout/     # Provided — do not modify
├── i18n/
│   └── locales/
│       ├── de.json        # German translations (all keys provided)
│       └── en.json        # English translations (all keys provided)
├── mocked/
│   ├── api/               # fetchDashboard(), fetchEmployees(), fetchEmployeeFilters()
│   ├── data/              # Raw mock data arrays
│   ├── hooks/             # useDashboard(), useEmployees()
│   └── types/             # TypeScript interfaces
├── routes/
│   ├── app-layout.tsx     # Layout wrapper — do not modify
│   ├── home.tsx           # YOUR TASK — Dashboard page
│   └── employees.tsx      # YOUR TASK — Employees page
└── routes.ts              # Route config — do not modify
```

---

## Your Tasks

### Task 0 — Implement the Data Hooks (`app/mocked/hooks/`)

The hooks `useDashboard()` and `useEmployees()` are **stubbed out** — they have the correct TypeScript types and return shape, but they return empty/default values and do not call the mock API. You need to implement them before the pages will show any data.

**Requirements:**

- `useDashboard()` should call `fetchDashboard()` from `app/mocked/api/dashboard.ts` and manage loading, error, and data state
- `useEmployees()` should call `fetchEmployees()` and `fetchEmployeeFilters()` from `app/mocked/api/employees.ts` and manage loading, error, and data state
- Both hooks should expose a `refetch` function that re-triggers the data fetch
- Handle the asynchronous nature of the mock API (it simulates a 300 ms delay)

**Hints:**

- Look at the mock API functions in `app/mocked/api/` to see what they return
- The return types are already defined in the hook stubs — your implementation must match them

---

### Task 1 — Dashboard Page (`app/routes/home.tsx`)

Build an overview dashboard that displays HR metrics and recent activity. Use the `useDashboard()` hook to fetch data.

**Requirements:**

- Page header with title, description, and action buttons (link to `/employees`)
- An info banner (announcement)
- A responsive grid of KPI cards (4 columns on desktop, 2 on tablet, 1 on mobile) showing:
  - Label, value, trend change, and an icon per KPI
- An activity feed section using the `List` component, showing recent employee actions with avatars
- An upcoming events section using the `List` component, showing dates and category tags
- An onboarding progress section with progress bars
- A loading state using `Skeleton` components while data is being fetched
- All visible text must use translation keys via `t()`

**Unity UI components you will likely use:** `Stack`, `Grid`, `Card`, `Typography`, `Icon`, `Button`, `Tag`, `List`, `InfoBox`, `Avatar`, `Skeleton`, `ProgressIndicator`

---

### Task 2 — Employees Page (`app/routes/employees.tsx`)

Build an employee list page with a data table. Use the `useEmployees()` hook to fetch data.

**Requirements:**

- Page header with title and description
- A `Table` displaying all employees with these columns:
  - Name (with avatar), Vorname, Beruf, Telefonnummer, Postleitzahl, Eintrittsdatum, Uberlassen bis, Status (as colored tags), Aktionen (row menu)
- A loading state using `Skeleton` while data is fetched
- Status displayed as colored `Tag` components (each `EmployeeStatus` maps to a different color/label)
- Row actions via a `PopUpMenu` (edit, view details, delete)
- All visible text must use translation keys via `t()` where applicable

**Unity UI components you will likely use:** `Stack`, `Table`, `Typography`, `Avatar`, `Tag`, `Button`, `PopUpMenu`, `Chip`, `TextField`, `Skeleton`

---

### Task 3 — Working Filters (Employees Page)

The employees page must include functional filters that actually filter the displayed data. This is the most important part of the challenge from a logic perspective.

**Requirements:**

- A **text search field** that filters employees by `nachname` or `vorname` (case-insensitive)
- **Chip-based filter menus** for each filter category. The filter options come from `useEmployees().filters`:
  - Beruf
  - Postleitzahl
  - Eintrittsdatum
  - Uberlassen bis
  - Status
- When a filter is selected, only matching employees appear in the table
- Multiple filters should combine (AND logic — all active filters must match)
- The table title should reflect the current count (e.g., `Alle Mitarbeitenden (8)` when filtered)
- Clicking an already-selected filter should deselect it (toggle behavior)

**Hints:**

- The `useEmployees()` hook returns the full unfiltered list — filtering happens in your component
- Use `useMemo` to derive the filtered list so it only recalculates when filters or search change
- Check `app/mocked/types/employee.ts` for the `Employee` type to see which fields are filterable

---

## Acceptance Criteria

- [ ] `useDashboard()` and `useEmployees()` are fully implemented, calling the mock API and managing loading/error/data state
- [ ] Dashboard page renders all sections (KPIs, activity, upcoming events, onboarding progress)
- [ ] Dashboard consumes `useDashboard()` and shows a loading skeleton while fetching
- [ ] Employees page renders a table with all columns and employee data
- [ ] Employees page consumes `useEmployees()` and shows a loading skeleton while fetching
- [ ] Text search filters employees by name (case-insensitive)
- [ ] Each chip filter correctly filters the table
- [ ] Multiple active filters combine with AND logic
- [ ] Table count updates to reflect filtered results
- [ ] All components come from `@zvoove/unity-ui` — no custom HTML elements for things the library provides
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] The app runs without console errors

## Bonus Points

These are not required but will positively influence our evaluation:

- Responsive layouts that adapt to mobile/tablet/desktop
- Clean separation of concerns (e.g., filter logic extracted into a custom hook)
- Column visibility toggle (show/hide table columns)
- Sorting support on the table
- Smooth handling of empty/error states
- Good use of the component library's props API (variants, sizes, responsive props)
- Deploy the app somewhere publicly accessible (e.g., Vercel, Netlify, Cloudflare Pages) and share the URL
- Set up CI/CD checks on the repository (e.g., GitHub Actions for linting, type checking, or build verification)

## AI Usage

You are welcome to use AI tools (Cursor, Copilot, ChatGPT, Claude, etc.) to complete this challenge. We care about the result and your ability to explain it, not whether you typed every line by hand.

However, keep in mind:

- **There will be a technical interview** where you walk us through your solution. You should be able to explain every decision, from component choices to filter logic.
- If you used AI, we would appreciate you sharing your session history so we can see how you prompted and iterated. Most tools support this:
  - **Cursor** -- Export the chat via the Composer history or share the session link
  - **GitHub Copilot Chat** -- Copy the conversation from the chat panel
  - **ChatGPT / Claude** -- Share the conversation link or export as PDF/Markdown
- This is not a penalty -- seeing your prompting approach is a positive signal. It shows us how you think, break down problems, and guide AI toward the right solution.

## Submission

1. Push your solution to a Git repository
2. If you used AI, include `AI_SESSION.md` file in your repository.
3. The deadline is **7 days** from when you receive this challenge

We estimate the challenge takes **2 to 4 hours** of focused work. Take the time you need to deliver **quality** over quantity.

Good luck!
