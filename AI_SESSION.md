# Project analysis for code quality issues
_Exported on 6/21/2026 at 23:55:51 GMT+2 from Cursor (3.5.33)_

---

**User**

Analyze the entire project, catch major and medium JS/TS/React/CSS/HTML syntax mistakes, code smells, missing translations, misconfigurations, performance issues, any other issues worth fixing. Take into account that this is the initial phase and there is a lot of mocked/todo/basic code.

---

**Cursor**

I'll analyze the project thoroughly. Let me start by exploring the structure and key files.

Let me read all the core application files.

Now the mocked layer and config files.

Now the config files and remaining items.

Let me check the `.nvmrc`, the deleted Error component, and run typecheck/lint.

Let me verify translation key coverage and check the dev server terminal for runtime errors.

Let me run a read-only type check to catch any compile errors.

I've completed a full read-through of the project. Here's my analysis, grouped by severity. I've excluded things that are intentionally stubbed/TODO for this initial phase (e.g. `home.tsx` returning `null`, `useDashboard` stub, the `<div>EmployeesPage</div>` placeholder).

## Major issues

### 1. `Dockerfile` is broken — uses npm against a pnpm project
The project uses pnpm (`pnpm-lock.yaml`, `pnpm-workspace.yaml`, README says `pnpm install`), but the Dockerfile uses `npm ci` and copies a `package-lock.json` that doesn't exist.

```1:9:Dockerfile
FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
```

- `npm ci` requires `package-lock.json` → the build will fail outright.
- Should use `corepack enable && pnpm install --frozen-lockfile` and copy `pnpm-lock.yaml`.
- Node version mismatch: image is `node:20-alpine`, but `.nvmrc` says `24` and the README says "Requires Node 24". Bump to `node:24-alpine`.

### 2. Missing translations — locale files are incomplete
The README claims the locale files "already contain every translation key you need", but `de.json`/`en.json` only contain `nav`, `language`, and `user`. Keys actually referenced in code/data are missing:

- `error.unknown` and `error.retry` — used right now in `ErrorState.tsx`:

```14:18:app/components/ErrorState/ErrorState.tsx
      <Typography>{t(error?.message || "error.unknown")}</Typography>
      <Button variant="filled" color="primary" onClick={onRetry}>
        <Icon name="refresh" />
        <Typography color="on-primary">{t("error.retry")}</Typography>
```

With these keys missing, i18next will render the raw key string (e.g. literally `error.retry`).
- The entire `dashboard.*` namespace referenced in `app/mocked/data/dashboard.ts` (`dashboard.announcement`, `dashboard.kpis.*`, `dashboard.activity.*`, `dashboard.time.*`, `dashboard.upcoming.*`, `dashboard.tags.*`, `dashboard.onboarding.*`) has no entries in either locale file. This will surface as soon as the dashboard is wired up.

### 3. `ErrorState` uses `error.message` as a translation key (anti-pattern)

```14:14:app/components/ErrorState/ErrorState.tsx
      <Typography>{t(error?.message || "error.unknown")}</Typography>
```

Real runtime errors (`"Network request failed"`, etc.) are not translation keys. Passing them to `t()` just echoes the raw English message, defeating i18n and leaking internal messages to the user. Better: map known error types to keys, or always show a generic `t("error.unknown")` and log the real message.

## Medium issues

### 4. Invalid Vite config option
```5:9:vite.config.ts
export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
```
`resolve.tsconfigPaths` is not a real Vite option — it's silently ignored. The `~/*` alias actually resolves because the React Router v7 plugin reads `tsconfig.json` paths. This line is dead/misleading config; either remove it or add the real `vite-tsconfig-paths` plugin if you want explicit control.

### 5. `<html lang>` is hardcoded and contradicts the default language
```19:19:app/root.tsx
    <html lang="en">
```
The i18n default/fallback is `de` (`i18n.ts`), and the `languageChanged` handler updates `document.documentElement.lang` only *after* a language change. On first paint the document advertises `lang="en"` while content renders in German — an a11y/SEO correctness issue. Initialize it from the persisted/default language.

### 6. No linting / formatting / CI tooling
There is no ESLint, Prettier, or GitHub Actions config, and no `lint` script in `package.json`. The README explicitly lists CI checks and linting as bonus points. This is also why issues like the unused variable below aren't caught automatically.

### 7. Theme application causes a flash (FOUC)
```5:9:app/ClientPreferences.tsx
  useEffect(() => {
    applyPersistedTheme();
  }, []);
```
Theme is only applied after React mounts in `useEffect`. Since SSR is disabled, the first paint always shows the default (light) theme before switching — dark-mode users get a flash. Typically solved with a tiny blocking inline script in `<head>` that sets `data-theme` before hydration.

## Minor issues / nits

### 8. Unused destructured variable in `EmployeesPage`
```5:12:app/features/employees/pages/EmployeesPage.tsx
function EmployeesPage() {
  const { employees, filters, isLoading, error, refetch } = useEmployees();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState onRetry={refetch} error={error} />;

  return <div>EmployeesPage</div>;
};
```
`employees` and `filters` are destructured but unused (expected at this stage). Also note the stray semicolon after the function declaration on line 12 (harmless empty statement). `tsconfig` doesn't enable `noUnusedLocals`/`noUnusedParameters`, so these slip through — worth enabling.

### 9. Mid-refactor leftovers in git
Git status shows `D app/components/Error/Error.tsx` and an untracked `app/components/Error/ErrorState.tsx`, while the live file lives at `app/components/ErrorState/ErrorState.tsx`. The dev terminal log (`terminals/1.txt`) is full of `No route matches URL "/app/components/Error/..."` errors from the rename. Current imports resolve correctly to `~/components/ErrorState`, but clean up the stale `app/components/Error/` path/files and the duplicate untracked file before committing.

### 10. `formatHeaderDate(new Date(), ...)` recomputed every render
```142:144:app/components/Layout/Layout.tsx
                  <Typography color="on-surface-variant" as="span">
                    {formatHeaderDate(new Date(), i18n.language)}
                  </Typography>
```
Minor: a new `Date` and `Intl.DateTimeFormat` are created on every render. Negligible now, but if the header re-renders frequently it could be memoized. Not urgent.

### 11. `favicon.ico` exists but isn't linked
`links` returns `[]` in `root.tsx` while `public/favicon.ico` exists. Browsers auto-request `/favicon.ico` so it likely works, but an explicit `<link rel="icon">` is cleaner.

## Things that look good
- TypeScript compiles cleanly (`tsc --noEmit` passes) and `strict` is on.
- `useTheme` via `useSyncExternalStore` with a `MutationObserver` is a solid, SSR-safe pattern; `getServerSnapshot` is provided.
- Constants/enums (`LANGUAGES`, `THEMES`) are well-typed with `as const` + derived union types.
- `useEmployees` correctly handles loading/error/refetch with `Promise.all` and a stable `useCallback`.
- `mockFetch` uses `structuredClone` to avoid mutating shared mock data — nice touch.
- Sensible `localStorage`/`window`/`document` `typeof` guards throughout (defensive even though SSR is off).

The highest-impact fixes are the **Dockerfile** (build will fail) and the **missing `error.*`/`dashboard.*` translation keys** (visible broken text). Want me to switch to Agent mode and fix any of these?

---

**User**

Implement fixes for 1-5, 10, 11. For missing translations figure out the most generic and wide used words. Ignore the  rest for now.

---

**Cursor**

I'll implement fixes 1-5, 10, and 11. Let me set up a task list and start working through them.

Starting with the Dockerfile (fix 1):

Now fix 2 — translations. Updating both locale files:

Now fix 3 — ErrorState. Show a generic translated message and log the real error for debugging instead of misusing `t()`:

Now fix 4 — remove the invalid `resolve.tsconfigPaths` from the Vite config:

Now fixes 5, 10, 11 in `root.tsx` and `Layout.tsx`. First `root.tsx`:

Now fix 10 — memoize the header date in `Layout.tsx`:

Now let me update todos and verify everything compiles and lints clean.

All fixes are implemented, type-checks pass, and there are no lint errors. Summary of changes:

**1. Dockerfile** (`Dockerfile`) — Rewritten to use pnpm via `corepack enable` with `pnpm-lock.yaml`/`pnpm-workspace.yaml` and `node:24-alpine` (matching `.nvmrc`/README). Production stage uses `pnpm install --prod --frozen-lockfile` and starts with `pnpm run start`.

**2. Missing translations** (`app/i18n/locales/en.json`, `de.json`) — Added the `error.*` keys (`unknown`, `retry`) and the full `dashboard.*` namespace (`announcement`, `kpis`, `activity`, `time`, `upcoming`, `tags`, `onboarding`) referenced by `app/mocked/data/dashboard.ts`, using generic, widely-used HR wording in both languages.

**3. ErrorState anti-pattern** (`app/components/ErrorState/ErrorState.tsx`) — No longer passes `error.message` into `t()`. It now always renders the translated generic `t("error.unknown")` and logs the real error to the console for debugging. `error` prop made optional.

**4. Vite config** (`vite.config.ts`) — Removed the invalid/no-op `resolve.tsconfigPaths` option (the `~/*` alias is resolved by the React Router plugin from `tsconfig.json`).

**5. `<html lang>`** (`app/root.tsx`) — Now initialized from `i18n.language` instead of hardcoded `"en"`, so first paint matches the default/persisted language (German).

**10. Header date memoization** (`app/components/Layout/Layout.tsx`) — `formatHeaderDate(new Date(), ...)` is now wrapped in `useMemo` keyed on `i18n.language`, avoiding a new `Date`/`Intl.DateTimeFormat` on every render.

**11. Favicon** (`app/root.tsx`) — `links` now returns `{ rel: "icon", href: "/favicon.ico", type: "image/x-icon" }`.

One note on the ErrorState type: `EmployeesPage` calls it inside an `if (error)` block, so TypeScript narrows the `Error | null` to `Error` before passing it — no type issue there.

---

**User**

I don't agree that 3 was an anti-pattern. Take into account that known keys for errors might and most likely will be added in the future. Currently only unknown error is displayed which blocks translated errors completely. Unknown error should be displayed conditionally only when there's no known. t() funcion allows to do it passing text and default text as an array with 2 elements.

---

**Cursor**

You're right — with the key-fallback array form, `t()` resolves the first key that exists and only falls through to the generic message when nothing matches, so it doesn't block future translated error keys at all. My version was too aggressive in removing that capability. Calling it an "anti-pattern" was wrong; the real (and only) problem with the original was the *missing* fallback, which the array form solves cleanly.

Since I'm in Ask mode I can't edit, but here's the approach I'd recommend.

The key behavior: i18next, when given an array of keys, returns the translation for the **first key that exists** and falls back to the last one otherwise. So:

```tsx
const ErrorState = ({ onRetry, error }: Props) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const messageKey = error?.message || "error.unknown";

  return (
    <Stack direction="column" align="center" justify="center" height="100%">
      <Typography>{t([messageKey, "error.unknown"])}</Typography>
      <Button variant="filled" color="primary" onClick={onRetry}>
        <Icon name="refresh" />
        <Typography color="on-primary">{t("error.retry")}</Typography>
      </Button>
    </Stack>
  );
};
```

How it resolves:
- Future known error → throw `new Error("error.network")`; `t(["error.network", "error.unknown"])` finds `error.network` and shows the translated specific message.
- Arbitrary runtime message (e.g. `"Network request failed"`) → not a key, so it falls back to the translated `error.unknown` instead of leaking the raw English string.
- No error / empty message → `messageKey` is `"error.unknown"`, array is `["error.unknown", "error.unknown"]`, shows generic.

A couple of caveats worth keeping in mind:
- This contract requires that errors meant to be displayed are thrown with their `message` set to a translation key (e.g. `error.network`). For a mock-API challenge that's fine, but if real errors arrive whose `message` happens to collide with an existing translation key, you'd show that key's text by accident. If you want to be stricter later, a dedicated field (e.g. `error.cause` or a custom `AppError` with a `translationKey`) is cleaner than overloading `message`.
- You'll need to add those specific keys (`error.network`, etc.) to `de.json`/`en.json` as they're introduced — `error.unknown` and `error.retry` are already there.
- Keep the `console.error(error)` so the real underlying message is still visible to developers even when the UI shows the generic fallback.

Want me to switch to Agent mode and apply this version?

---

**User**

Keys will be specified in the future. For now implement it as is, assuming that error message might be a valid key.

---

**Cursor**

Let me read the current state of the file and apply the key-fallback version.

Done. `ErrorState` now treats `error.message` as a translation key with a graceful fallback:

```19:21:app/components/ErrorState/ErrorState.tsx
  const messageKey = error?.message || "error.unknown";

  return (
    <Stack direction="column" align="center" justify="center" height="100%">
```

```22:22:app/components/ErrorState/ErrorState.tsx
      <Typography>{t([messageKey, "error.unknown"])}</Typography>
```

`t([messageKey, "error.unknown"])` resolves the specific key when it exists (for keys added later), and falls back to the translated generic message otherwise. The `console.error(error)` is kept so the raw error stays visible to developers. Type-check and lint both pass.

---

**User**

I've just installed Biome for linting. Setup a proper configuration regarding the project stack, code style and structure. Add appropriate cli commands to package.json

---

**Cursor**

Let me check the installed Biome version and current package.json setup.

Biome 2.5.0 is installed. Let me create a proper `biome.json` tailored to this stack (React 19 + TS + React Router 7 + Tailwind v4 + i18n JSON), matching the existing code style (2-space, double quotes, semicolons, trailing commas), and wire up CLI scripts.

Now add the CLI scripts to `package.json`:

Now let me validate the config is parseable and see what Biome reports across the repo (read-only, no `--write`):

The config is valid and working. Most of the 16 "errors" are formatting differences (single vs double quotes, import organization, line wrapping) since the existing code predates Biome. Let me see the actual lint warnings/info distinctly from formatting.

Everything is wired up and the config validates cleanly. Here's what I set up.

## `biome.json`
A Biome 2.5.0 config tuned to the stack and existing conventions:

- **VCS integration** — `useIgnoreFile: true` so Biome honors `.gitignore` (skips `node_modules`, `.react-router`, `build`), plus explicit excludes for `public` and `pnpm-lock.yaml`.
- **Formatter** — 2-space indent, 80 line width, LF endings (matches the React Router template and current files).
- **JS/TS style** — double quotes (JSX too), always semicolons, `trailingCommas: "all"`, always arrow parens — the dominant style in the repo (this is what normalizes the single-quote files in `ErrorState.tsx`/`Skeleton.tsx`).
- **Import organizing** — via `assist.actions.source.organizeImports`.
- **Linter** — `recommended` on (includes React hooks + a11y rules), plus targeted rules:
  - `useImportType: error` and `useConst: error` — aligns with `verbatimModuleSyntax` in `tsconfig.json`.
  - `noUnusedImports` / `noUnusedVariables` / `useExhaustiveDependencies` set to **`warn`** rather than `error` — deliberately, so the intentional mocked/placeholder code (e.g. the unused `employees`/`filters` in `EmployeesPage.tsx`) surfaces without hard-failing lint during this initial phase.
- **JSON & CSS formatting** enabled (covers locale files and `app.css`).

## `package.json` scripts
```json
"lint": "biome lint .",
"lint:fix": "biome lint --write .",
"format": "biome format .",
"format:fix": "biome format --write .",
"check": "biome check .",
"check:fix": "biome check --write ."
```
`check`/`check:fix` run formatter + linter + import sorting together (recommended for CI and pre-commit); the granular `lint`/`format` variants are there if you want them separately.

## Current state when run against the repo
- `biome lint` passes (exit 0) with only the 2 expected `noUnusedVariables` warnings on the `EmployeesPage` placeholders + 1 import-sort info.
- `biome check` reports formatting differences on pre-existing files (quote style, import grouping, a couple of line wraps, missing trailing newline in `package.json`) — all auto-fixable.

I left the existing files untouched since reformatting the whole repo is a broad change you didn't explicitly ask for. Want me to switch to Agent mode and run `pnpm check:fix` to normalize everything to the new config in one pass?

---

**User**

Inside .ai/RULES.md generate general code styleguide for ai/llms tools. Analyze the project, Readme, instruct to avoid unnecessary comments, using biome rules, prefer unity-ui components.

---

**Cursor**

Let me analyze the newly added files to align the styleguide with established conventions.

Let me check the current `package.json` and any vitest config to reference scripts accurately.

I have a full picture of the stack now: React 19 + React Router 7 (SPA), TypeScript strict, Tailwind v4, `@zvoove/unity-ui`, `react-i18next`, Biome 2.5, Vitest + Testing Library, and CI. Let me write the styleguide.

Let me make sure the new markdown file conforms to the Biome config (it formats unknown/JSON but let me confirm it doesn't flag the doc) and that `llms.txt` points to the right path.

Biome doesn't process Markdown, so `RULES.md` is correctly left untouched (the "ignored" message is expected, not an error in a normal `pnpm check` run).

One thing I noticed: `llms.txt` points to `./ai/RULES.md`, but the actual path is `.ai/RULES.md` (with the leading dot) — that link is broken. Let me fix it so the index resolves.

Done. I created `.ai/RULES.md` — a code styleguide for AI/LLM tools, derived from analyzing the actual project and the README.

It covers:

- **Stack & commands** — React 19 / React Router 7 SPA, TS strict, Unity UI + Tailwind v4, react-i18next, pnpm/Node 24; plus the `pnpm check` / `typecheck` / `test` gates that mirror CI.
- **Formatting & style — defer to Biome** — documents the enforced rules (double quotes, 2-space, semicolons, trailing commas, `import type`, auto import-sorting, `const`/no `!`) and says not to fight the formatter.
- **Comments — avoid narration** — explicit instruction to never write comments that restate what code does, only non-obvious intent/constraints, and not to use comments to describe changes.
- **UI — prefer `@zvoove/unity-ui`** — reach for library components (`Stack`, `Grid`, `Table`, `Tag`, etc.) before raw HTML, use their props API and Tailwind tokens, typed icon names, theme via `useTheme()`.
- **i18n** — all text through `t()`, add keys to both `de.json` and `en.json`, key-fallback array pattern for errors.
- **Structure/conventions** — feature-first layout, `index.ts` barrels, `~/*` alias, function components, hook naming, `as const` enums, `useMemo` for derived data.
- **TypeScript, data layer, testing (Vitest + RTL), and a "definition of done."**

I also fixed a broken link in `llms.txt` (`./ai/RULES.md` → `./.ai/RULES.md`) so the guidance index actually resolves to the new file.

Note: `.ai/skills/feature-generator/SKILL.md` is still empty — let me know if you'd like me to draft that skill too.

---

**User**

analyze how features/employees is pre-implemented. This is a basic component for prototype purposes, no real structure implemented yet. Take it as an example how to generate other features. Inside .ai/skills/feature-generator/@.ai/skills/feature-generator/SKILL.md  generate instructions that will navigate how to create further features. Take into account @.ai/RULES.md , ts config, biome config, basic unit tests, skeletons, error state. For every step keep in mind that there might be no hook with real/mocked data, types and so on. If any of this is missing - generate it with simple fake data and explicitly comment as "stub".

---

**Cursor**

I have the full picture of the `features/employees` reference implementation and how it wires through the mocked data layer, routes, and tests. Let me write the feature-generator skill.

Done. I analyzed how `app/features/employees` is wired end-to-end and turned that into a step-by-step scaffolding skill at `.ai/skills/feature-generator/SKILL.md`.

What the skill captures:

- **Frontmatter** (`name` + `description`) so the tooling can auto-trigger it when someone asks to add a page/feature/route or wire a screen to data.
- **Reference map** — documents the exact `employees` layout (page + test + barrels, feature-local `Skeleton`, route module, `routes.ts` registration, and the `types → data → api → hook` mocked data layer) and the page's loading/error/content control flow as the contract to copy.
- **Naming conventions** — `<feature>`/`<Feature>` casing, `<Feature>Page`, `use<Feature>`, and the **domain-named** hook return field (`{ employees, ... }` / `{ dashboard, ... }`) rather than a generic `data`, matching the real hooks.
- **Stub policy** (your key requirement) — whenever types/data/api/hook are missing, generate a minimal version with simple fake data, a top-of-file `// stub: ...` comment plus inline `// stub` tags, keep types accurate, and always route through `mockFetch` (no invented backend). Hooks with no meaningful data yet mirror `useDashboard`'s `// TODO: implement` default-shape return.
- **Nine concrete steps** with copy-ready templates: types → mock data → api → hook → feature folder (Skeleton + Page + barrels) → route module → `routes.ts` registration → nav/breadcrumb + i18n in both locales → co-located Vitest test for the loading/error/ready states.
- **Definition of done** tied to `.ai/RULES.md`, Biome, tsconfig, and the CI gates (`pnpm check`/`typecheck`/`test`).

It defers all style/comment/Unity-UI/i18n rules to `.ai/RULES.md` rather than duplicating them, and emphasizes building content from Unity UI components over raw HTML.

The `SKILL.md` is Markdown, which Biome doesn't process, so there's nothing to lint/format here. Want me to also fill in any starter feature using this skill as a sanity check?

---

**User**

Create "dashboard" feature with feature-generator skill

---

**Cursor**

I'll follow the `feature-generator` skill to scaffold the `dashboard` feature. First let me note what already exists for dashboard vs. what's missing.

The data layer already exists (`types/dashboard.ts`, `data/dashboard.ts`, `api/dashboard.ts`), the `dashboard.*` i18n keys are present in both locales, and per the README the dashboard *is* the home route (`/`). What's missing: a real `useDashboard` implementation (currently a stub), the `app/features/dashboard/` folder, and wiring into `home.tsx`.

Step 1 — implement the `useDashboard` hook following the `useEmployees` pattern (data/api exist, so a real implementation, not a stub):

Steps 2-5 — create the feature folder, page, test, and wire the home route:

Now wire `DashboardPage` into the home route (the dashboard lives at `/` per the README), mirroring `employees.tsx`:

Now run the definition-of-done gates. First Biome auto-fix on the new/changed files, then the full checks:

Only the expected `dashboard` unused-var **warning** (warn-level, matching the `employees` prototype placeholder) — no formatting changes needed. Now the full gates:

All gates pass. Marking complete.

Created the `dashboard` feature following the `feature-generator` skill. Since the data layer already existed and the dashboard is the home route per the README, I adapted the relevant steps rather than duplicating.

**What I created:**
- `app/features/dashboard/pages/DashboardPage.tsx` (+ `index.ts` barrel) — consumes `useDashboard()`, renders `Skeleton` (loading), `ErrorState` (error), and placeholder content, exactly mirroring `EmployeesPage`.
- `app/features/dashboard/components/Skeleton/Skeleton.tsx` (+ `index.ts` barrel) — Unity UI loading state.
- `app/features/dashboard/pages/DashboardPage.test.tsx` — Vitest + Testing Library covering the loading/error/ready states, mocking the hook and collaborators.

**What I changed:**
- `app/mocked/hooks/useDashboard.ts` — replaced the stub with a real implementation following the `useEmployees` pattern (`useState`/`useCallback`/`useEffect`, error capture, `refetch`). Since `fetchDashboard()` and mock data already exist, no stubbing was needed.
- `app/routes/home.tsx` — now renders `<DashboardPage />` (the dashboard lives at `/`), mirroring `routes/employees.tsx`.

**Not needed** (already present): dashboard types/data/api, the `dashboard.*` i18n keys in both locales, and the `nav.home`/route registration.

**Verification:**
- `biome check .` — clean, only 3 warn-level `noUnusedVariables` (the intentional `employees`/`filters`/`dashboard` placeholders).
- `pnpm typecheck` — passes.
- `pnpm test` — 3 files, 8 tests passing (the 3 new dashboard tests included).

The page body is intentionally a `<div>DashboardPage</div>` placeholder, matching the prototype level of `employees` — the skill scaffolds the structure; building the actual KPI/activity/events UI from Unity UI components would be the next step whenever you want it.

---

**User**

Use Table component from unity-ui to display data on the Employees page with all filters provided.
Make nachname and vorname searchable (case insensitive). Multiple filters should combine results (AND logic).
Use React useMemo to derive the filtered list so it only recalculates when filters or search change.
Check app/mocked/types/employee.ts for the Employee type to see which fields are filterable.

---

**Cursor**

This is a substantial feature. Let me first inspect the actual `@zvoove/unity-ui` API for the components I'll need (`Table`, `Tag`, `Avatar`, `TextField`, `Chip`/filter menus, `PopUpMenu`), since I must use the real props.

There's an `llms.txt` shipped with the library. Let me read it and extract the `Table` API from the type definitions.

This is an excellent reference. Let me pull the exact TypeScript signatures for `Table`, `Chip`, `Tag`, `PopUpMenu`, and `Avatar` to avoid type errors.

`TableRowData` keys are exactly the column ids (no separate `id` field in the type). Let me confirm how the Table keys rows internally so I build `data` correctly.

Let me check `ColumnAlign`, `ChipProps`, `TagProps`, `AvatarProps`, and `PopUpMenuItem` exact shapes.

I now have the full API. I'll structure this cleanly (bonus: separation of concerns): a pure `useEmployeeFilters` hook for the logic, an `EmployeesTable` component for the UI, the page wiring states, plus i18n keys and tests. Let me set up todos and read the current locale files.

Now creating the filter hook:

Now the `EmployeesTable` component:

Now wire the page:

Now add the `employees` i18n namespace to both locales:

Now update the page test to mock `EmployeesTable`, and add a pure unit test for the filter hook:

Now the pure-logic unit test for the filter hook:

Now run the gates — Biome autofix on the new files first, then full check + typecheck + tests:

Let me see the full Biome output and run the other gates:

The shell is still `cd`'d inside `node_modules` from my earlier API inspection, so Biome resolved `.` to an ignored path. Let me run the gates from the project root explicitly.

Biome is clean (only the known dashboard placeholder warning). Now typecheck and tests:

All gates pass: typecheck clean, 4 test files / 15 tests passing.

The Employees page now renders a real Unity UI `Table` with all filters working. I checked the actual `@zvoove/unity-ui` type definitions (and its shipped `llms.txt`) to use the correct component APIs, and followed `.ai/RULES.md` (Unity UI components, i18n everywhere, separation of concerns).

**What I built:**

`app/features/employees/hooks/useEmployeeFilters.ts` — pure filter logic, derived with `useMemo` so it only recalculates when `employees`, `filters`, `search`, or `selected` change:
- Case-insensitive search over `vorname` + `nachname`.
- AND across categories, OR within a category.
- Field-aware matching for the heterogeneous mock options (this matters — see note below): `status`/`plz` by value, `beruf` by option label, `eintritt`/`ueberlassen` by year extracted from the `dd.mm.yyyy` dates.
- `toggleFilter` (toggle on/off), `clearFilters`, `activeFilterCount`.

`app/features/employees/components/EmployeesTable/EmployeesTable.tsx` — the UI:
- `Table` with columns Name (with `Avatar` + nachname), Vorname, Beruf, Telefonnummer, Postleitzahl, Eintrittsdatum, Überlassen bis, Status, Aktionen.
- Status as colored `Tag` (each `EmployeeStatus` → a distinct color).
- Row actions via `PopUpMenu` (view/edit/delete) — handlers are a clearly-marked `// stub`.
- Filter UI passed to the Table's `filters` slot: a `TextField` search + a `Chip`-triggered `PopUpMenu` (multi-select) per category; active chips switch to `primary` variant and show a count.
- Title reflects the live filtered count: `Alle Mitarbeitenden (N)`.

`EmployeesPage.tsx` now just branches on loading/error and renders `<EmployeesTable>`.

**i18n:** added an `employees` namespace (title, search, empty, columns, filters, status labels, actions) to both `de.json` and `en.json`.

**Tests:** added `useEmployeeFilters.test.ts` (7 cases: search case-insensitivity, value/label/year matching, AND combination, toggle-off) and updated `EmployeesPage.test.tsx` to mock the table and assert state branching. 15 tests pass; typecheck and Biome are clean.

**One thing worth flagging:** the mock `employeeFiltersData` options don't line up uniformly with the `Employee` fields — `beruf` options use slugs (`stapler`) while `employee.beruf` is the full label (`Staplerfahrer/in`), and the date facets are years vs. full dates. I handled each field appropriately in the matcher so every provided filter actually filters, but if the real API later returns consistent values, that `optionMatchers` map is the single place to simplify.

---

**User**

Move parseDate into features/employees/utils and write a proper (success and failing) unit tests.
Refactor handleColumnSort to wrap useCallback around util, which you'll create in features/employees/utils catalog with a proper unit tests.
Same thing with getColumnLabel.
Move filterControls into a new separate component file. Move consts/types to standalone consts/types.ts file if it's necessary to import/export them between different files.

---

**Cursor**

Let me read the current state of `EmployeesTable.tsx` — it's grown to 344 lines, so there's code I haven't seen (sorting, `parseDate`, etc.).

This is a clean refactor task. I'll extract pure utils (with tests), a `FilterControls` component, and a shared `types.ts`. Let me set up todos and build it.

Creating the shared types and the three utils with tests:

Now export `SelectedFilters` from the hook and create the `FilterControls` component:

Now refactor `EmployeesTable` to use the utils, shared types, and `FilterControls`:

Now add the `matchMedia` polyfill to the test setup so the `getColumnLabel` render test (which mounts Unity UI `Typography`/`Icon`) is stable:

All gates pass. Marking done.

Refactor complete. Biome is clean (only the known dashboard-placeholder warning), typecheck passes, and tests went from 15 → **27 passing across 7 files**.

**New `app/features/employees/utils/`** (each pure + tested):
- `parseDate.ts` — moved out of the component. `parseDate.test.ts` covers success (valid `dd.mm.yyyy` → timestamp, chronological ordering) and failing cases (empty, missing parts, non-numeric → `NaN`).
- `getNextOrderBy.ts` — the pure sort-toggle logic. `handleColumnSort` is now just `useCallback((column) => setOrderBy((prev) => getNextOrderBy(prev, column)), [])`. Test covers new-column→asc and asc⇄desc toggling.
- `getColumnLabel.tsx` — renders the sortable header; exports a pure `getSortIcon` helper too. `renderColumnLabel` in the component is now `useCallback(... => getColumnLabel({ column, label, orderBy, onSort: handleColumnSort }), [...])`. Test covers `getSortIcon` (inactive→null, asc→`arrow-up`, desc→`arrow-down`) and a render test asserting the label renders and click calls `onSort`.
- `index.ts` barrel.

**`app/features/employees/components/FilterControls/`** — `filterControls` extracted into its own component (search `TextField` + `Chip`/`PopUpMenu` per category), with a clean props interface (`search`, `onSearchChange`, `selected`, `onToggleFilter`, `filters`).

**`app/features/employees/types.ts`** — shared `SortableColumnId`, `SortDirection`, `OrderBy` (imported by the utils, their tests, and the component — this is the part that genuinely needed sharing). I exported `SelectedFilters` from the hook for `FilterControls`.

**Consts decision:** `STATUS_COLOR`, `SORTABLE_COLUMNS`, and `DEFAULT_ORDER_BY` are each used only inside `EmployeesTable`, so per your "if it's necessary to import/export between files" condition I left them in the component rather than creating a `consts.ts`. If you'd prefer them centralized anyway for organization, I can move them.

**Test setup:** added a `matchMedia` polyfill to `app/test/setup.ts`, since the `getColumnLabel` render test mounts real Unity UI components (`Typography`/`Icon`) and jsdom doesn't implement `matchMedia`.

`EmployeesTable.tsx` dropped from 344 to ~270 lines and now reads as composition (utils + `FilterControls`) rather than inline logic.

---

**User**

Analyze the screen and generate same looking layout on the DashboardPage. Use unity-ui components and dashboard.kpis data. Use Grid component but stack it as column on mobile.

---

**Cursor**

Let me look at the current `DashboardPage`, the KPI types, and verify the color tokens / `Icon` props I'll need.

`ForegroundColors` includes `green`/`yellow`/`steel-blue`/`error`, so I can map `changeColor` straight to `Typography color`. Let me read the current locale files to align the KPI labels with the screenshot wording and confirm the header keys.

The header keys exist. Now I'll update the KPI labels to match the screenshot wording in both locales, then build the grid. Let me read the German KPI block.

Now build the KPI grid on the DashboardPage (and remove the leftover `console.log`):

Now run the gates:

Typecheck and Biome are clean (the old `dashboard` unused-var warning is gone now that it's used). Let me confirm tests still pass.

Let me see the failure details — likely the `DashboardPage` test now needs a router context (`useNavigate`).

These failures are from the page now using `useNavigate` (needs a Router) plus my content change — the test predates both. Let me read the current dashboard test and fix it.

I'll fix the test: wrap renders in a router (the page now uses `useNavigate`) and update the content assertion to match the new KPI layout (assert the header title key and a KPI value render).

All 27 tests pass, and Biome + typecheck are clean.

I built the KPI grid on the `DashboardPage` to match the screenshot:

**Layout** — a `Grid` of KPI `Card`s driven by `dashboard.kpis`:
- Responsive columns: `{ minimum: 1, mobile: 2, laptop: 4 }` — stacked as a single column on mobile, 2-up on small/tablet, 4-up on laptop+ (matching the 2×2 you see at medium width).
- Each card (`Card variant="outlined"`): top row with the muted label (`Typography color="on-surface-variant"`) and the KPI `Icon` in primary color on the right; below it the big value (`Typography variant="display"`) with the colored `change` beside it.
- `changeColor` from the data (`green`/`steel-blue`/`yellow`/`error`) maps directly to `Typography`'s `color` since those are all valid `ForegroundColors` — so +12 is green, +3 steel-blue, 2 yellow, 1 red, exactly as in the image.

**i18n** — updated the KPI labels in both `de.json`/`en.json` to match the screenshot wording (Active employees / Open positions / In onboarding / Pending leave requests, and German equivalents), since the labels render via `t(kpi.labelKey)`.

**Cleanups while in the file:**
- Removed a leftover `console.log(dashboard)`.
- `kpis` is now derived from `dashboard?.kpis`, so the previously-unused `dashboard` variable warning is gone.

**Test fix** — the page had gained `useNavigate`, which threw outside a router, so I wrapped the test renders in `MemoryRouter` and updated the "data ready" case to assert the header title and a rendered KPI (`247`, `+12`) instead of the old placeholder text. The `matchMedia` polyfill added earlier covers the real Unity UI components now mounting in that test.

One note: the icons render as plain primary-colored Unity UI icons (`users`, `job`, `user-account`, `vacation` from the data). If you want the subtle circular "featured" treatment behind each icon, `Icon` has a `featured` prop I can switch on — say the word and I'll add it.

---

**User**

Identify and separate DashboardPage kpis, recent, activity, upcomingEvents and onboardingProgress boxes and move them to standalone components.

---

**Cursor**

Let me read the current `DashboardPage` and the dashboard types so I know exactly what to extract.


Extracting five sections into standalone components: KPIs, the recent InfoBox summary, activity feed, upcoming events, and onboarding progress.


Now refactor `DashboardPage` to compose the extracted components:


Renaming the activity component to avoid a TypeScript collision with the `DashboardActivity` type.


Split the dashboard into five standalone components under `app/features/dashboard/components/`, each with its own folder and barrel export. `DashboardPage` is now a thin composition layer (~85 lines).

**Extracted components**

| Component | Responsibility | Props |
|---|---|---|
| `DashboardKpis` | KPI card grid (1 col mobile → 2 → 4) | `kpis` |
| `DashboardRecentInfo` | Info banner with application/onboarding counts | `activities`, `onboardingProgress` |
| `DashboardActivityFeed` | Recent activity list with refresh | `activities`, `onRefresh` |
| `DashboardUpcomingEvents` | Upcoming events list with tags | `upcomingEvents` |
| `DashboardOnboardingProgress` | Onboarding progress bars | `onboardingProgress` |

Each component owns its own `useMemo`/`useTranslation` logic that previously lived in the page. The page keeps only the header, loading/error handling, and the two-column layout grid.

**Note:** The activity component is named `DashboardActivityFeed` rather than `DashboardActivity` to avoid clashing with the `DashboardActivity` type from `~/mocked/types/dashboard` under `verbatimModuleSyntax`.

**Verification:** Biome clean, typecheck passes, all 27 tests pass.

