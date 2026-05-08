# apps/app — SaaS shell (deferred)

This directory is a placeholder for the full SaaS shell that backs DropHouse's
self-serve product (auth, billing, brief history, dashboard).

## Status — Wave 2 batch 1 (2026-05-08)

Scaffold only. **Not yet wired**. The Wave 2 deliverable is the marketing
landing in `apps/landing/`. Full `apps/app/` build is scheduled for Wave 3.

## Plan

Fork [`wasp-lang/open-saas`](https://github.com/wasp-lang/open-saas) into this
directory. Open-SaaS gives us:

- Wasp-generated React + Express app
- Email/Google/GitHub auth
- Stripe + Lemon Squeezy billing
- Email (SendGrid / AWS SES)
- File uploads (S3)
- Cron jobs
- Admin dashboard

## What we'll add on top

| Module                | Path (planned)                   | Notes                                                                  |
|-----------------------|----------------------------------|-------------------------------------------------------------------------|
| Brief intake API      | `src/server/api/brief.ts`        | Validates payload, enqueues SQLite row, fires orchestrator job.         |
| Orchestrator client   | `src/server/orchestrator/`       | Wraps the brand → copy → render → deploy passes.                        |
| Brief history view    | `src/client/pages/Briefs.tsx`    | Per-user list of briefs + statuses + live URL + re-render button.       |
| Brand kits CRUD       | `src/client/pages/BrandKits.tsx` | Save palette + voice for reuse on subsequent briefs.                    |
| Custom domain UI      | `src/client/pages/Domain.tsx`    | DNS instructions, ACME poll status, re-issue.                           |
| Billing (Stripe)      | inherited from open-saas         | Self-serve $29 / Team $99 / Concierge $1,200+99.                        |

## Initialisation (when Wave 3 lands)

```bash
# from repo root
git clone --depth=1 https://github.com/wasp-lang/open-saas.git apps/app
rm -rf apps/app/.git
cd apps/app/template/app  # the open-saas Wasp template
wasp start db
wasp start
```

Until Wave 3 starts, this directory exists so the monorepo layout is final
and the import paths in `apps/landing` already account for cross-referencing.
