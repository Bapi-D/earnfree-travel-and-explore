# TODO - Security hardening for admin/Firebase

## Step 1: Review current security
- Verify Firestore rules: public read/write scope, role checks.
- Verify Storage rules: package images/profile files read/write scope.
- Review server endpoints under `src/server.ts` for `/__admin/*` routes.

## Step 2: Block unauthenticated admin access (necessary changes)
- Add admin authorization to embedded handlers for:
  - `GET/POST/PATCH/DELETE /__admin/enquiries`
  - `GET/POST/DELETE /__admin/profiles`
  - `GET/POST/DELETE /__admin/destinations` (if exists)
  - `GET/POST/PUT/DELETE /__admin/packages` (if exists)
  - `POST /__admin/analytics/*` (if exists)

## Step 3: Remove client-side Firestore admin fallbacks
- Update `src/lib/firebase-data.ts` to stop using Firestore client calls for admin CRUD.
- Ensure admin flows use only backend endpoints.

## Step 4: Keep serviceAccountKey.json unchanged
- Do not modify or remove `serviceAccountKey.json` as requested.

## Step 5: Validate
- Build & run the project.
- Smoke test:
  - Public browsing works.
  - Unauthenticated users cannot hit any `/__admin/*` endpoints.
  - Admin role users still can.

