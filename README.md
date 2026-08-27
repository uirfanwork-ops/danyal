# Academy Manager

A management system for a teaching academy: student fees, discounts, a permanent
record of every payment, attendance, and teacher payouts.

**Status: phase 1 is built and deployed.** Records only — billing, payments and
the transaction log are phase 2.

Plan: **[docs/SPEC.md](docs/SPEC.md)** — written in plain English for the academy
owner. Anything marked `[ASSUMPTION]` still needs a yes or no.

## What works today

- Email and password sign-in, with three roles: owner, office staff, teacher
- Invitation-only access — an uninvited email gets no access at all
- Students: add, edit, search, and a dated fee history per student
- Teachers, and pay arrangements visible only to the owner
- Classes: a teacher, a weekly schedule, and enrolled students
- Settings: academy name, currency, fee due day
- A record of who did what, readable by the owner

## What is not built yet

Monthly billing, discounts, recording payments, receipts, the transaction log,
attendance, and teacher payout runs. See the build order in the spec.

## How it is put together

| | |
|---|---|
| Application | Next.js (React, TypeScript), deployed on Vercel |
| Database | PostgreSQL on Supabase, tables prefixed `am_` |
| Security | Postgres row level security — the rules live in the database, not the screens |

The app holds **no secret key**. It queries the database as the signed-in person,
so a bug in a screen cannot expose data that person is not entitled to.

### Roles

| | Owner | Office staff | Teacher |
|---|---|---|---|
| See all students | ✅ | ✅ | own classes only |
| Add / edit students and fees | ✅ | ✅ | ❌ |
| See teacher pay | ✅ | ❌ | own only |
| Invite people, change settings | ✅ | ❌ | ❌ |

Verified against the database directly, not just in the UI.

## Running it locally

```bash
npm install
cp .env.example .env.local   # fill in the two values
npm run dev
```

## Configuration

Two environment variables, both safe to expose — the database is protected by row
level security, not by hiding these:

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → Data API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → publishable key |

Without them the app renders a plain "not connected to its database yet" page
rather than failing.

## Database changes

Applied as migrations against the Supabase project:

| Migration | What it does |
|---|---|
| `academy_manager_phase1_tables` | Core records |
| `academy_manager_phase1_security` | Splits teacher pay into its own table; row level security for every table |
| `academy_manager_phase1_signup` | Invitation-only signup trigger |
| `academy_manager_phase1_revoke_rpc` | Stops helper functions being callable over the API |

The signup trigger shares `auth.users` with an unrelated system in the same
database, so it is written never to raise — it grants academy access to invited
emails and ignores everyone else.
