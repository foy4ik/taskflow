# TaskFlow

A task manager built as a **Telegram Mini App** — runs inside Telegram's WebView, authenticates users via Telegram's own identity (never a client-supplied id), and looks/feels native to whatever theme Telegram is running in.

Home screen, task list with filters/search/sort, a create/edit bottom sheet, a 7-day statistics chart, and settings (theme, language, timezone, notifications) — all backed by a Next.js API and PostgreSQL.

## Table of contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Environment variables](#environment-variables)
- [Local development](#local-development)
- [Database & migrations](#database--migrations)
- [Telegram Mini App setup](#telegram-mini-app-setup)
- [Production deployment](#production-deployment)
- [Known limitations](#known-limitations)

## Architecture

Everything lives in one Next.js app (App Router) — API routes double as the backend, so there's no separate server to deploy or keep in sync.

```
prisma/
  schema.prisma          # User, Category, Task, Reminder models
  seed.ts                # seeds shared default categories

src/
  proxy.ts               # session-cookie auth gate for /api/tasks|statistics|me|categories
  app/
    layout.tsx            # fonts, Telegram script tag, AppProviders
    (main)/                # route group: pages that share BottomNav
      page.tsx             # Home
      tasks/page.tsx        # Tasks (filters/sort/search)
      tasks/[id]/page.tsx    # Task detail (deep-link / desktop)
      statistics/page.tsx
      settings/page.tsx
    api/
      auth/telegram/route.ts # verifies initData -> upserts user -> sets session cookie
      tasks/route.ts          # GET (list), POST (create)
      tasks/[id]/route.ts      # GET, PATCH, DELETE
      statistics/route.ts
      categories/route.ts
      me/route.ts              # GET/PATCH profile & preferences
      cron/reminders/route.ts   # reminder-delivery extension point

  components/
    ui/                   # shadcn/ui primitives (Base UI under the hood)
    layout/                # BottomNav
    common/                 # EmptyState, ErrorState, SkeletonList, OfflineBanner, ConfirmDialog

  features/                # one folder per screen/domain
    tasks/                  # TaskCard, TaskFormSheet, TaskDetailSheet, filters, hooks
    home/                    # Greeting, StatsSummary, ProgressBar
    statistics/               # chart + breakdown components
    settings/                  # profile/theme/language/timezone/notifications

  hooks/                   # app-wide hooks (Telegram WebApp, haptics, online status, media query)
  providers/                # QueryProvider, TelegramProvider, ThemeProvider, I18nProvider
  lib/                      # prisma client, telegram auth, validation (zod), api response helpers, i18n dictionaries
  services/api/              # typed fetch client — the only place that calls `fetch`
  types/                      # shared TS types matching the API shape
```

**Why this shape:** `services/api/*` is the single seam between UI and network — every component reads/writes tasks through a typed function, never raw `fetch`. `features/*` groups a screen's components, hooks, and utils together instead of splitting by technical layer, so a screen's code lives in one place. `lib/telegram/verifyInitData.ts` + `src/proxy.ts` are the only two files that ever establish identity — everything downstream just trusts the `x-user-id` header `proxy.ts` attaches after verification.

## Tech stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui (Base UI primitives), Framer Motion
- **Backend:** Next.js Route Handlers
- **Database:** PostgreSQL via Prisma ORM 7 (driver adapters — `@prisma/adapter-pg`)
- **State/data:** TanStack Query (caching, optimistic updates), React Hook Form + Zod (forms/validation)
- **Charts:** Recharts
- **Auth:** Telegram WebApp `initData`, verified server-side (HMAC-SHA256) + a short-lived signed session cookie (`jose`)

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/taskflow?schema=public` |
| `TELEGRAM_BOT_TOKEN` | From [@BotFather](https://t.me/BotFather). Required for real Telegram auth (HMAC verification). |
| `SESSION_SECRET` | Random 32+ byte string, used to sign the session cookie. Generate with `openssl rand -base64 32`. |
| `TELEGRAM_AUTH_MAX_AGE_SECONDS` | How old an `initData` payload can be before it's rejected. Default `86400` (24h). |
| `ALLOW_MOCK_TELEGRAM_AUTH` | `true`/`false`. Dev-only fallback auth for testing outside Telegram — see below. **Must be unset/`false` in production**; it's also hard-gated by `NODE_ENV !== "production"` server-side regardless of this flag. |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app (used in a few places for absolute links). |
| `CRON_SECRET` | Shared secret required (as `x-cron-secret` header) to call `POST /api/cron/reminders`. |

Note: Prisma 7's CLI (`migrate`, `generate`, `seed`) reads `DATABASE_URL` from `prisma.config.ts`, not directly from `.env` — that file already does `import "dotenv/config"` so it Just Works as long as `.env` exists. Next.js itself loads `.env` normally for the running app.

## Local development

Prerequisites: Node 20+, a PostgreSQL server (local install, Docker, or a hosted instance).

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL, SESSION_SECRET, etc.
npm run prisma:migrate  # creates the database schema
npm run prisma:seed     # seeds default categories (Work, Personal, Shopping, Health, Study, Other)
npm run dev
```

Open `http://localhost:3000`. With `ALLOW_MOCK_TELEGRAM_AUTH=true` (the default in `.env.example`), the app signs you in as a fixed dev user automatically — no real Telegram bot needed to develop the UI. The mock path sends no client-supplied identity at all (just a flag); the server owns the fixed dev identity, so it can't be used to impersonate an arbitrary user even in dev.

Useful scripts:

```bash
npm run dev             # dev server (Turbopack)
npm run build            # production build
npm run start              # run the production build
npm run lint                 # ESLint
npm run typecheck              # tsc --noEmit
npm run prisma:studio            # visual DB browser
```

## Database & migrations

Schema lives in `prisma/schema.prisma`. Models: `User`, `Category` (shared defaults + optional per-user categories), `Task`, `Reminder`.

```bash
npm run prisma:migrate -- --name <change-description>   # create + apply a migration in dev
npm run prisma:generate                                    # regenerate the Prisma Client (into src/generated/prisma)
npm run prisma:seed                                          # re-run the default-category seed (idempotent)
```

In production, run `npx prisma migrate deploy` (applies existing migrations without generating new ones) as part of your deploy step, before starting the app.

## Telegram Mini App setup

To test with a real Telegram bot instead of the dev mock:

1. **Create a bot:** message [@BotFather](https://t.me/BotFather) → `/newbot` → follow the prompts. Save the token into `TELEGRAM_BOT_TOKEN`.
2. **Expose your local server over HTTPS** — Telegram requires HTTPS for Mini Apps, so `localhost` alone won't work from the Telegram client. Use a tunnel, e.g.:
   ```bash
   npx ngrok http 3000
   # or: cloudflared tunnel --url http://localhost:3000
   ```
   Set `NEXT_PUBLIC_APP_URL` to the resulting HTTPS URL.
3. **Register the Mini App:** back in BotFather, `/newapp` (or `/myapps` → your bot → *Edit Bot* → *Web App*), and set the Web App URL to your tunnel URL.
4. **Turn off mock auth:** set `ALLOW_MOCK_TELEGRAM_AUTH=false` (or just leave it unset) so real `initData` is required.
5. **Open it:** in Telegram, message your bot and tap its menu button, or open `https://t.me/<your_bot>/<app_name>` directly.

Your Telegram profile (name, username, photo, language) will flow through `POST /api/auth/telegram`, get HMAC-verified against `TELEGRAM_BOT_TOKEN`, and create/update your `User` row — the client's claimed identity is never trusted on its own.

## Production deployment

Any Node-capable host works (the app is a standard Next.js app); Vercel is the path of least resistance:

1. Provision a PostgreSQL database (Vercel Postgres, Neon, Supabase, RDS, etc.) and copy its connection string into `DATABASE_URL`.
2. Set all env vars from the table above in your host's dashboard — **`ALLOW_MOCK_TELEGRAM_AUTH` unset/`false`**, a real `SESSION_SECRET`, and your real `TELEGRAM_BOT_TOKEN`.
3. Run `npx prisma migrate deploy` against the production database (a one-off build step or release command).
4. Deploy. The app must be served over HTTPS (required both by Telegram and by the session cookie's `Secure` attribute).
5. Update your bot's Web App URL in BotFather to the production domain.
6. If you want real reminder delivery, point a scheduler (Vercel Cron, a GitHub Actions schedule, etc.) at `POST /api/cron/reminders` with an `x-cron-secret` header matching `CRON_SECRET`, and implement the actual Telegram `sendMessage` call in `lib/notifications/sendReminder.ts` (the extension point is already wired up — see the comment there).

## Known limitations

- **Reminder delivery is a stub.** `Reminder` rows are created/updated automatically alongside `Task.dueDate`, and `POST /api/cron/reminders` (secret-protected) will pick up due ones — but `sendReminder()` currently just logs and marks them `SENT` instead of calling the Telegram Bot API. Wiring that call up, plus pointing a real scheduler at the endpoint, is the last step for live push reminders.
- **Date-bucket filters (Today/Upcoming/Overdue) use the server's UTC clock**, not each user's `timezone` field. Good enough for a single-timezone dev/demo use, but a user far from UTC could see a task's bucket flip a few hours off from their local midnight.
