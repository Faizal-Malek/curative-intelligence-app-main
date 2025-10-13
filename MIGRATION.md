# Migration checklist — MongoDB → Supabase (Postgres)

This checklist guides you through migrating data and wiring a Postgres LISTEN/NOTIFY job queue.

1) Prepare Supabase
  - Create a Supabase project and note the Postgres connection string.
  - Store the connection string as `DATABASE_URL` in your platform secrets or `.local.env` for local dev.

2) Create tables in Supabase
  - Option A (recommended): Use Prisma migrations
    - Set `DATABASE_URL` locally
    - Run `npx prisma migrate dev --name init`
    - Run `npx prisma generate`
  - Option B: Run the provided SQL directly in Supabase SQL Editor
    - Open `prisma/init_schema.sql` and paste it into Supabase SQL editor and run.

3) Generate Prisma client
  - Run: `npx prisma generate`

4) (Optional) Migrate existing data from Mongo
  - Ensure you have a copy/backup of your Mongo data.
  - Set `MONGO_URI` and `DATABASE_URL` in your environment.
  - Run: `npm run migrate:mongo2pg`
  - Verify counts in Supabase and ensure relations preserved.

5) Start the Postgres worker
  - Locally: ensure `DATABASE_URL` is set and run:
    - `npm run worker:start`
  - The worker listens for `NOTIFY jobs` and processes `JobQueue` rows.

6) Update your app to use the new queue
  - `src/lib/queue.ts` already implements enqueue via Postgres by default.
  - Ensure your generate-batch route uses `enqueueGenerationJob` (already wired).

7) Production deployment
  - Add `DATABASE_URL`, `Supabase_SECRET_KEY`, `Supabase_WEBHOOK_SECRET`, `GEMINI_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to your platform's secret store.
  - Deploy the Next app; run migration in CI: `npx prisma migrate deploy`.
  - Deploy worker as a separate service (small container) with the same `DATABASE_URL`.

Notes
  - If you prefer Redis later for higher throughput, reconfigure `QUEUE_STRATEGY=redis` and provide REDIS_HOST/REDIS_PORT.
  - Always test migrations on a copy of production data first.

