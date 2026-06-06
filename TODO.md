# TODO - Admin General Results + Subject Assignment Enhancements

## Step 1 — Implement subject mapping by Standard
- Define subject lists for Std I–II, Std III–IV, Std V–VII using exact names from the requirements.
- Ensure these subjects exist in DB (`subjects` table). Seed them similarly to existing default subjects.

## Step 2 — Admin general results API (ranked table)
- Add admin-only endpoint to fetch general results for:
  - Standard (I–VII)
  - Exam type (result_type)
  - Academic year
- Endpoint returns per-student:
  - student id/name/gender
  - marks per subject (only subjects applicable to that Standard)
  - total, average, grade (A–F)
  - position ranking (ties handled deterministically)

## Step 3 — Admin results UI update
- Update `client/css/js/pages/admin-results.html` to add:
  - Year dropdown/input
  - Standard options I–VII
- Replace current client-side computation with a call to the new general-results endpoint.

## Step 4 — Admin assigns subjects to teachers (enforce class/standard scoping)
- Add teacher-class/standard assignment support (if not already present) so teachers only submit/view results for assigned standards.
- Update teacher routes/controllers to respect this.

## Step 5 — Testing
- Run `npm run dev`.
- Verify:
  - admin can load general results for different standards/exam types/years
  - table includes correct subject columns per standard
  - subject assignment by admin works
  - teacher results queries are scoped to assigned standards

