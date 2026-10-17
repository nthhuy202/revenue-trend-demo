# Revenue Trend Demo

## Goal

A Revenue Trend chart card (weekly POS / Eatclub revenue, labour cost, covers, events, compare with previous week, PNG export) whose data comes from a Node API backed by Postgres and is edited through an authenticated admin UI. Must install and run from the README on a fresh Linux/macOS machine. This is an interview take-home: correctness, clarity and a clean git history matter more than features.

## Structure

```
backend/                 Express 5 API, ESM, plain JS, no build step
  prisma/                schema.prisma, migrations/, seed.js
  src/
    app.js               express app (middleware, routers, error handler)
    server.js            entry point, env checks, listen
    db.js                Prisma client
    routes/              revenueTrend.js (public), auth.js, admin.js
    lib/                 pure logic: week.js, summary.js, validate.js, serialize.js, auth.js, rateLimit.js
  test/                  node:test suites, one per module
frontend/                Next.js 15 App Router, React 19, TypeScript, Tailwind v4
  src/
    app/                 routes: / (chart), /admin, /admin/login
    components/revenue/  chart card: RevenueTrendCard, TrendChart, EventBadge, KpiTiles, ChartLegend, SeriesToggles, series.ts
    components/admin/    LoginForm, AdminDashboard, WeekEditor, EventsEditor
    lib/                 api.ts, types.ts, week.ts, format.ts
    middleware.ts        redirects /admin/* to login without a token cookie
docker-compose.yml       Postgres 16
```

The frontend proxies `/api/*` to the backend (rewrite in `frontend/next.config.ts`), so auth is a same-origin httpOnly cookie.

## Commands

```
docker compose up -d db                  # Postgres on 5432
cd backend && npm run db:migrate && npm run db:seed
cd backend && npm run dev                # API on 4000
cd backend && npm test                   # all backend tests
cd frontend && npm run dev               # app on 3000
cd frontend && npm run lint && npm run build
```

## Conventions

- Dates travel as `YYYY-MM-DD` strings and are computed in UTC everywhere; Prisma date columns are `@db.Date`.
- Weeks are ISO weeks (Mon–Sun) written `YYYY-Www`, e.g. `2026-W42`. 2026 has 53 ISO weeks.
- Money is `Decimal(12,2)` in the database and a JS number in every API response.
- `totalRevenue = posRevenue + eatclubRevenue`; `avgPerDay = totalRevenue / 7`; `changePct` is `null` when the previous value is 0, else rounded to 1 decimal.
- Ports: backend 4000, frontend 3000, Postgres 5432.
- README commands are POSIX shell only.
- Code, comments, commit messages and UI copy are in English. Comments explain why, not what.

## Workflow

- Never commit or push unless the user asks in that turn.
- Commit messages follow Conventional Commits (`feat(frontend): ...`, `fix(backend): ...`). No `Co-Authored-By` or other AI attribution lines.
- Before saying a change is done: `npm test` in backend, `npm run lint && npm run build` in frontend, for whichever side changed.
- Change behavior → update the README and any UI copy that describes it in the same change.
