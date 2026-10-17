---
paths:
  - "backend/**"
  - "docker-compose.yml"
---

# Backend rules

Express 5 (ESM, plain JS), Prisma 6, PostgreSQL 16, tests with `node:test`.

## Project conventions

- Routes in `src/routes/` stay thin: parse input → validate → call Prisma / `src/lib` → serialize → respond.
- Pure logic lives in `src/lib/` and has a test in `test/`. Before adding a helper, grep `src/lib/` for one that already does the job.
- Dates: only through `src/lib/week.js` (UTC, ISO weeks). Never `new Date()` local-time math or `getDay()` / `getDate()`; use the UTC variants.
- Every response that contains a Prisma row goes through `src/lib/serialize.js`. Raw `Decimal` values must never reach JSON (they serialize as strings).
- Schema change → new migration with `npx prisma migrate dev --name <change>`. Never edit an existing migration.
- `prisma/seed.js` is create-only: it must never overwrite data an admin already edited.

## Security (must follow)

1. **Passwords** are hashed with `bcryptjs` (cost ≥ 10) and checked with `bcrypt.compare`. Never store, log or return a password or hash.
2. **Rate limit** `POST /api/auth/login` (per IP and per email). The API sits behind the Next.js proxy, so read the client IP from `X-Forwarded-For` (`app.set('trust proxy', 'loopback')`), not the socket.
3. **Sessions expire.** The JWT `expiresIn` and the cookie `maxAge` are set and equal (currently 7 days). Logout clears the cookie with the same options it was set with.
4. **Cookies** are `httpOnly`, `sameSite: 'lax'` (or stricter) and `secure` in production. Use the shared `cookieOptions` in `src/lib/auth.js`; never build cookie options inline.
5. **Secrets** (`JWT_SECRET`, `DATABASE_URL`, admin password) come from env only, never have a fallback default, and the server refuses to start without them. Never commit `.env`; keep `.env.example` in sync with placeholder values.
6. **Validate on the server**, always, even when the frontend validates too. Validate the whole payload first (`src/lib/validate.js`); on any error return 400 with a message and write nothing.
7. **Generic errors.** Clients get `{ error: "<short message>" }` with the right status. 500s say `Internal server error`; stack traces, Prisma messages and SQL never reach the response.
8. **Parameterized queries only.** Use the Prisma client API. `$queryRaw` only as a tagged template; never `$queryRawUnsafe` / `$executeRawUnsafe` or string-built SQL.
9. **Security headers.** Disable `x-powered-by`; send `X-Content-Type-Options: nosniff` on API responses.
10. **No CORS.** The frontend reaches the API same-origin through the proxy. If CORS is ever needed, allow-list exact origins; never `*` with credentials.
11. **Database not public.** In `docker-compose.yml`, publish Postgres on `127.0.0.1` only, never on all interfaces.

## Logging

- `console.error` for unexpected errors in the error handler, and the startup line in `server.js`. Nothing else.
- No debug `console.log` left in committed code. Never log request bodies, cookies, tokens or passwords.

## Tests

- New or changed logic in `src/lib/` or a route gets a `node:test` case, including the failure path (bad input → 400, no auth → 401).
- Edge cases this project has already been bitten by: ISO year boundary (`2027-W01` ← `2026-W53`), timezone drift on `@db.Date`, `Decimal` leaking as strings, previous week with no data (`changePct: null`).
- Run `npm test` before saying a backend change is done.
