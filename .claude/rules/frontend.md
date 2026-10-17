---
paths:
  - "frontend/**"
---

# Frontend rules

The whole codebase follows these rules. The mechanical ones (names, Props types, inline types, boolean state, one component per file, empty catch, 300-line cap, blank line before return, `React.FormEvent`, `export *`, direct `localhost:4000`) are enforced by `frontend/eslint.config.mjs`: `npm run lint` must pass with 0 problems. The rest are on you.

## Project conventions

- Next.js 15 App Router, React 19, TypeScript strict, Tailwind v4, path alias `@/` → `src/`.
- Components: PascalCase filenames (`TrendChart.tsx`), one folder per area under `src/components/` (`revenue/`, `admin/`). Non-component modules: camelCase (`week.ts`, `series.ts`).
- Shared code lives in `src/lib/` (`api.ts`, `types.ts`, `week.ts`, `format.ts`). Code used by one area stays in that area's folder.
- Object shapes use `type`, consistently (the codebase already does).
- Buttons: raw `<button>` with an explicit `type`. Icons: `lucide-react` only. Images: `next/image`. Internal links: `next/link`; `<a>` only for external URLs.
- No class-merging helper is installed. Do not add one; see the className rule below.

## Must avoid (project-specific, these cause real bugs)

- Hardcoded, random or mocked chart data. Every number on screen comes from `/api/revenue-trend`.
- Calling `http://localhost:4000` directly. Always call `/api/*` through `src/lib/api.ts`; the rewrite keeps the auth cookie same-origin.
- Storing the auth token anywhere in JS (`localStorage`, state, query string). It lives only in the httpOnly cookie.
- Date math with local time or a new date library. Use `src/lib/week.ts` (UTC, ISO weeks).
- Series colours other than the ones in `src/components/revenue/series.ts`.
- Letting an older response overwrite a newer one when the week changes. Ignore stale responses (see `AdminDashboard`).
- Page-level horizontal scroll at 375px width. Wide content (chart, tables) scrolls inside its own `overflow-x-auto` wrapper.
- Secrets or backend-only values in `NEXT_PUBLIC_*` env vars. Anything `NEXT_PUBLIC_` ships to the browser.

## Before writing new code

- Grep `src/lib/` and the area folder for an existing helper, type or constant with the same name or job. Reuse it, or move it to `src/lib/` if a second area needs it. Never create a second copy.
- KISS and YAGNI: no parameters, config or abstractions for needs that do not exist yet.
- No magic numbers or strings in conditions, timeouts or comparisons: name them (`MAX_AGE_MS`, `CHART_MIN_WIDTH`).

## Components

- One component per file. A component over ~300 lines must be split; move each phase or section into a child component.
- `src/app/**/page.tsx` stays thin: read params, render one component from `src/components/`.
- Server components by default. Add `"use client"` only for state, effects, browser APIs or event handlers, and keep that boundary as low in the tree as possible.
- Every declared hook, variable and import is used.

## Naming

- Names describe meaning. No `a`, `d`, `e`, `r`, `p`, `res`, `tmp`, `val`, `obj`, `arr`, `fn`, `cb` (only `i` in a plain `for` loop). Callback params too: `day` not `d`, `event` not `e`.
- Functions start with a verb: `handleSave`, `fetchWeek`, `formatMoney`.
- Booleans start with `is`, `has`, `should`, `can`: `isSaving`, `hasData`, `isExporting`.

## Types

- Props type is named `<ComponentName>Props`, never `Props`.
- No inline object types in signatures; declare a named type above the function.
- Constant arrays and objects get an explicit type.
- React 19: no `React.FormEvent` / `FormEventHandler`. Use `React.SyntheticEvent<HTMLFormElement>` for `onSubmit`, `React.ChangeEvent<HTMLInputElement>` for `onChange`.
- No `any`. No `as` casts to silence an error; fix the type.

## State and data fetching

- Group related `useState` values into one object (form fields together, field errors together). Do not group unrelated state.
- Never mutate state or props; always build a new object or array.
- Side effects (fetch, timers, subscriptions, DOM access) go in `useEffect` or an event handler, never in the render body.
- Keep state local. Lift it only when two components genuinely share it; no prop drilling through 3+ levels.
- Every request handles loading, success and error, and the error is visible to the user with a way to retry.
- No empty `catch`. Surface the error or rethrow it.
- `memo` / `useMemo` / `useCallback` only after measuring a real re-render problem.

## Code style

- Blank line between logical blocks, and before `return` when there is logic above it.
- Early return / guard clauses instead of nested `if`.
- Each field validation is its own `if`; a validate function builds one result object and sets state once.
- className: no nested ternaries inside template strings and no array `.join(" ")`. Move conditional class logic into a small named function above the JSX (`changeColor(pct)` in `KpiTiles` is the pattern).
- Every `eslint-disable` has a comment on the line above saying why. If you cannot explain it, fix the code instead.

## Accessibility

- Semantic elements (`button`, `nav`, `main`, `table`, `label`), never a clickable `div`.
- Every input has a `<label>`, every image has `alt`, icon-only buttons have `aria-label`.
- Everything works with the keyboard.

## UI copy

- When behavior changes (a limit, a label, a step), grep for the old wording and update every place that shows it in the same change.
