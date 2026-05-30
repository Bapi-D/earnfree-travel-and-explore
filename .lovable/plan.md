# Earnfree Travel — Admin / Staff / User Platform

Lovable Cloud is now enabled (database + auth + realtime + storage). Because the request is huge, I'll ship it in **5 phases**. Each phase is a complete, working slice — you can use it before the next one lands.

## Architecture decisions (locked in)

- **Auth**: Lovable Cloud auth (email + password, Google OAuth). JWT + RLS handled by the platform — no custom JWT code needed.
- **Roles**: separate `user_roles` table + `has_role()` security-definer function (the only safe RBAC pattern). Three roles: `admin`, `staff`, `user`.
- **Realtime**: Lovable Cloud Realtime on the `enquiries` table — drives the staff notification bell + live counters. No Socket.IO.
- **Excel export**: SheetJS (`xlsx`) generated client-side from authenticated admin queries.
- **Charts**: Recharts (already installed) for all analytics.
- **Image storage**: Cloud Storage bucket `package-images`.
- **Admin login**: I'll seed the admin account with the credentials you gave (`admin` / `JoyEFT@26`) inside the database. The "secondary password" `Earn#46` will gate destructive actions (delete staff, delete package) as a confirm step.
- **Staff routing**: enquiry starts at Staff 1 → bypass moves to Staff 2 → Staff 3 → Admin Review. Stored as `assigned_to` + full `enquiry_history` audit log.

## Phase 1 — Foundation (this turn)

Database, roles, auth UI, capsule carousel, login-gated booking.

1. **Database migration**:
   - `profiles` (id, full_name, email)
   - `app_role` enum + `user_roles` table + `has_role()` function
   - `packages` (title, image, description, price, location, category, featured)
   - `enquiries` (customer info + status enum `pending|solved|bypassed|admin_review` + `assigned_to` + `bypass_count`)
   - `enquiry_history` (audit log)
   - `staff_profiles` (staff_number 1/2/3, active)
   - RLS policies for every table
   - Trigger to auto-create profile + default `user` role on signup
   - Enable realtime on `enquiries`
   - Storage bucket `package-images`
2. **Auth system**:
   - `AuthModal` component with sliding Login/Signup animation, glassmorphism, Google sign-in button
   - `useAuth` hook + session listener
   - Navbar shows user initials (e.g. "SA") with dropdown: Profile / Logout
   - `Book Now` buttons trigger AuthModal if not logged in
3. **Most Demanded Tourist Places** capsule carousel:
   - Infinite right-to-left scroll, glassmorphism capsules, glowing gradient borders
   - 26 destinations (Paris, Taj Mahal, Goa, … NYC) with curated Unsplash images
   - Placed immediately **before** Signature Journeys
4. Admin seed: `admin@earnfree.local` / `JoyEFT@26` with admin role.

## Phase 2 — Admin Dashboard

- `/admin` route, protected by admin role
- Sidebar layout: Dashboard / Packages / Enquiries / Staff / Analytics
- Dashboard: KPI cards (total leads, solved, pending, bypassed), recent enquiry table, monthly bar chart, staff performance chart
- Package manager: CRUD + image upload to storage bucket
- Staff manager: add/edit/remove/suspend staff (assigns role + staff_number)
- Enquiry manager: filter by status, view full history, reassign
- Excel export button → SheetJS `.xlsx` download of all leads
- `Earn#46` secondary password confirm dialog on delete actions

## Phase 3 — Staff Panels (×3)

- `/staff` route, protected by staff role; auto-scoped to that staff member's `staff_number`
- Realtime bell icon with badge + beep on new assigned enquiry
- KPI cards (total / solved / pending for this staff)
- Enquiry list with **Solve** and **Bypass** buttons
- Bypass logic: Staff 1→2→3→admin_review (server-side trigger)
- Analytics: monthly line chart (total / solved / pending), enquiry history table

## Phase 4 — User Experience polish

- `/profile` page (edit name, view past enquiries)
- Booking flow: package detail → enquiry form (pre-fills user info) → submit → real-time goes to Staff 1
- Toast confirmations, loading states everywhere

## Phase 5 — Hardening

- Input validation (Zod) on every form
- Rate-limit-friendly debouncing on enquiry submit
- SEO meta on admin/staff routes (`noindex`)
- Final security review + a `cloud_status` check before publish

## Technical notes

- Frontend: all UI uses existing semantic tokens (`--primary` #D0232C, `--gold` #F4A300, `--charcoal`). No raw hex in components.
- Server: data mutations go through `createServerFn` with `requireSupabaseAuth` middleware where role checks are needed; public reads (packages, capsule carousel) hit Supabase directly via `supabase` client.
- Bypass routing implemented as a Postgres function `bypass_enquiry(enquiry_id)` so the logic is atomic and audited.

---

**Approve this plan and I'll start Phase 1 immediately.** Phases 2–5 will follow in subsequent turns — each one a focused, reviewable change rather than one giant unreadable diff.
