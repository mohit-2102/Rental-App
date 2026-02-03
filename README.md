# Rentfull Seed Troubleshooting (Postmortem)

This README documents why `npm run seed` failed initially, what was changed to fix it, and how to debug or fix it on your own in the future.

**Status:** `npm run seed` now works and successfully inserts data.

## Why It Was Not Working Initially

There were multiple blockers layered together:

1. Prisma 7 requires an adapter or Accelerate URL
- Prisma 7 no longer allows `new PrismaClient()` with no options.
- The original seed script instantiated Prisma without an adapter, which caused a `PrismaClientInitializationError` before any database work happened.

2. Seed data was not available in the compiled output
- The seed script was executed from `dist/prisma/seed.js`.
- `seed.js` looks for JSON files in `dist/prisma/seedData`, but that folder was never copied to `dist`.
- That causes file read failures (`ENOENT`) when seeding.

3. Tables did not exist yet
- When the loader issue was fixed and the seed ran, it failed because the database had no tables (`P2021` / `relation does not exist`).
- This happened because Prisma migrations had not been applied to the database.

4. `resetSequence` used the wrong Prisma model key
- The function used `prisma[ModelName]` instead of the correct camelCase `prisma.modelName`.
- This would fail later in the run if it got past the other issues.

## What Changed To Fix It

1. Added a Prisma Postgres adapter
- Updated `server/prisma/seed.ts` to create a PG pool and pass it to Prisma:
  - Uses `@prisma/adapter-pg` and `pg`.
  - `DATABASE_URL` is required and validated at startup.

2. Updated the seed script to use a build-and-run flow
- Updated `server/package.json` so `npm run seed`:
  1. Builds TypeScript to `dist`
  2. Copies `prisma/seedData` into `dist/prisma/seedData`
  3. Runs `node dist/prisma/seed.js`

3. Fixed `resetSequence` to use the correct Prisma model
- Updated `server/prisma/seed.ts` so it uses `prisma[camelCaseModel]`.

4. Applied migrations before seeding
- Running `npx prisma migrate dev` creates the tables.
- After that, seeding works.

## Current Seed Command

From `server/package.json`:

```
npm run build && shx rm -rf dist/prisma/seedData && shx cp -r prisma/seedData dist/prisma/seedData && node --env-file=.env dist/prisma/seed.js
```

## How To Do This Without Help Next Time

Use this checklist:

1. Verify environment
- Ensure `DATABASE_URL` is set in `server/.env`.
- Ensure Postgres is reachable.

2. Generate Prisma client
- Run: `npx prisma generate`

3. Apply migrations (required if tables do not exist)
- Run: `npx prisma migrate dev`
- If you do not want migrations, use: `npx prisma db push`

4. Build and seed
- Run: `npm run seed`

5. If it fails, map error code to action
- `PrismaClientInitializationError`: missing adapter or invalid config.
- `P2021` or `relation does not exist`: run migrations or `db push`.
- `ENOENT` on `seedData`: ensure `seedData` is copied to `dist`.

## Files That Were Touched

- `server/prisma/seed.ts`
- `server/package.json`

## Optional Improvements

- Add a pre-seed check for table existence with a clearer error message.
- Add a `seed:prepare` script that runs migrations and seed in one step.
