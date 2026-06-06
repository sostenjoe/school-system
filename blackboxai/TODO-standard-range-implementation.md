# TODO: Standard range → teacher subjects (class B)

## Goal
When admin selects a teacher and selects one or more standards (I–VII individually, but grouped internally), the allowed subjects list should update automatically.
Behavior: **Intersection** across all selected groups.

## Steps
- [ ] DB: add table `teacher_standard_ranges` for `teacher_id` + `standard_group` (I-II / III-IV / V-VII)
- [ ] DB seed/upgrade: ensure table exists (SQLite + MySQL paths)
- [ ] Backend APIs:
  - [ ] GET teacher’s selected standard groups
  - [ ] PUT teacher’s selected standard groups
  - [ ] (optional helper) GET allowed subjects for a teacher based on selected groups
- [ ] Backend model helpers in `server/models/Teacher.js`
- [ ] UI updates in `client/css/js/pages/admin-settings.html`:
  - [ ] add multi-select standards I–VII
- [ ] UI updates in `client/css/js/admin-settings.js`:
  - [ ] when teacher changes: load saved standards, populate UI, then set subject list based on intersection
  - [ ] when standards change: recompute subject list and keep it in multi-select
  - [ ] when submit: save standards first, then assign subjects

## Notes
- `server/constants/standardSubjects.js` defines the mapping from standard group → subject names.
- Intersection rule means allowed subjects = subjects that belong to every selected standard group.

