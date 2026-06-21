# AI / LLM Code Styleguide

Authoritative rules for AI assistants (Cursor, Copilot, Claude, etc.) working in
this repository. Read this before generating or editing code. Read `README.md`
for the product context and task scope; this file governs _how_ to write code.

## Stack

- **React 19** + **React Router v7** in **SPA mode** (`ssr: false`, see
  `react-router.config.ts`). No loaders/server code — data is fetched client-side.
- **TypeScript** in `strict` mode with `verbatimModuleSyntax`.
- **`@zvoove/unity-ui`** as the component library + **Tailwind CSS v4** for layout.
- **`react-i18next`** for all user-facing text (German default, English fallback).
- **Biome 2.5** for lint + format, **Vitest** + **Testing Library** for tests.
- Package manager is **pnpm** (Node 24, see `.nvmrc`). Never use `npm`/`yarn`.

## Commands (must pass before considering work done)

```bash
pnpm check       # Biome lint + format + import sorting
pnpm typecheck   # react-router typegen && tsc
pnpm test        # vitest run
```

Use `pnpm check:fix` to auto-apply formatting/safe fixes. The same checks run in
CI (`.github/workflows/ci.yml`), so code that fails them will fail CI.

## Formatting & style — let Biome decide

Do **not** hand-format or argue with the formatter. Biome (`biome.json`) is the
single source of truth. The enforced style is:

- 2-space indentation, 80-character line width, LF line endings.
- **Double quotes** for JS/TS and JSX. Always semicolons. Trailing commas
  everywhere (`all`). Always wrap arrow params in parens.
- Imports are auto-organized — don't manually reorder them.
- Use `import type { ... }` for type-only imports (required by
  `verbatimModuleSyntax` and enforced by the `useImportType` rule).
- Prefer `const`; `let` only when reassigned. Never `var`.
- Avoid non-null assertions (`!`) — narrow types instead.
- Don't leave unused variables/imports. The few intentional placeholders in
  mocked/TODO code are `warn`-level only; new code should be clean.

## Comments — write code that explains itself

- **Do not add comments that narrate what the code does.** No
  `// import the hook`, `// loop over employees`, `// return the result`.
- Only comment **non-obvious intent, trade-offs, or constraints** the code
  cannot express (e.g. why a workaround exists, a spec quirk, an SSR guard).
- Never use comments to communicate with the reviewer or describe a change —
  that belongs in the commit/PR, not the source.
- Keep existing `// TODO:` markers; add new ones only for genuine follow-ups.

## UI — prefer `@zvoove/unity-ui`, then Tailwind

- **Always reach for a Unity UI component before writing raw HTML.** Use
  `Stack`, `Grid`, `Card`, `Typography`, `Button`, `Icon`, `Tag`, `List`,
  `Table`, `Avatar`, `Skeleton`, `ProgressIndicator`, `PopUpMenu`, `Chip`,
  `TextField`, `InfoBox`, etc. instead of `<div>`/`<span>`/`<button>`/`<table>`.
- Use the component's props API (variants, sizes, `color`, responsive props like
  `columns={{ minimum: 1, tablet: "auto 1fr" }}`) rather than re-styling with CSS.
- Use Tailwind only for layout glue (spacing, flex/grid) and prefer the design
  tokens already in use (`gap-sm`, `p-lg`, `bg-background`, `h-dvh`,
  `tablet:` breakpoints) over arbitrary values.
- Icons come from Unity UI's `CommonIconNames` — use typed names, not strings.
- Theme is driven by `data-theme` on `<html>` (see `app/theme/useTheme.ts`); read
  theme via `useTheme()`, never toggle classes manually.

## Internationalization — no hardcoded text

- Every user-facing string goes through `t("namespace.key")` from
  `useTranslation()`. No literal UI text in JSX.
- When adding a key, add it to **both** `app/i18n/locales/de.json` and `en.json`.
  Keep the nested structure and `camelCase` leaf keys (e.g. `dashboard.kpis.employees`).
- Mock data references translation **keys** (e.g. `labelKey`, `titleKey`), not
  translated strings — resolve them with `t()` at render time.
- For error display, pass a key-fallback array: `t([messageKey, "error.unknown"])`
  so known keys win and unknown messages fall back gracefully.

## Project structure & conventions

```
app/
  components/        # shared, app-wide components (Layout, ErrorState)
  features/<name>/   # feature-scoped code
    pages/           # route-level page components
    components/      # feature-local components
  mocked/{api,hooks,data,types}/   # data layer (swap for real API later)
  i18n/, theme/, constants/, routes/
```

- **Feature-first organization.** Keep a feature's pages/components/hooks under
  `app/features/<feature>/`. Promote to `app/components/` only when shared.
- **Barrel exports:** each component folder has an `index.ts` re-exporting the
  default (`export { default as X } from "./X";`). Import from the folder, not
  the file.
- **Imports:** use the `~/*` alias for cross-area imports (`~/components/...`,
  `~/mocked/...`); use relative paths only for close siblings.
- **Components:** function components only. A component file default-exports the
  component and is re-exported via its barrel.
- **Hooks:** `useX.ts`, named export, in the relevant feature or `mocked/hooks`.
  Follow the Rules of Hooks; declare complete `useEffect`/`useMemo` dependency
  arrays (`useExhaustiveDependencies` is on).
- **Constants/enums:** model as `as const` objects with a derived union type
  (see `app/constants/preferences.ts`), not TS `enum`.
- **Derived data:** compute with `useMemo` (e.g. filtered lists) rather than
  duplicating state.

## TypeScript

- No `any`. Prefer precise types; reuse the shared types in `app/mocked/types/`.
- Type props with a local `type Props = { ... }`; destructure in the signature.
- Keep functions small and typed at the boundary (params + return).
- Guard browser globals (`window`, `document`, `localStorage`) with `typeof`
  checks where code may run outside the DOM.

## Data layer

- UI consumes data through hooks (`useEmployees`, `useDashboard`) that wrap the
  `app/mocked/api` functions and expose `{ data, isLoading, error, refetch }`.
- Keep the hook return shape stable and typed; components must handle loading
  (`Skeleton`) and error (`ErrorState`) states explicitly.
- Don't call mock API functions directly from components — go through a hook.

## Testing

- Co-locate tests as `*.test.tsx` next to the unit under test.
- Use Vitest + Testing Library (`@testing-library/react`, `jest-dom`); query by
  user-visible text/roles, not implementation details.
- Mock hooks/child components with `vi.mock` to isolate the unit (see
  `app/features/employees/pages/EmployeesPage.test.tsx`).
- Add or update tests when changing behavior; keep them passing.

## Definition of done

A change is complete only when `pnpm check`, `pnpm typecheck`, and `pnpm test`
all pass, all new UI text is translated in both locales, and no narrating
comments were introduced.
