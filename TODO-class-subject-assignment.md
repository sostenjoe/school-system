# Class-specific subject assignment (teacher portal)

## Goal
Implement: **Select class → choose subjects for that class → save**, so marks are entered only for the selected subjects within that class.

## Current state
- `teacher_subjects` stores subjects per teacher globally (not per class).
- `teacher-portal` loads students by `results/class/:className/subject/:subjectId` and currently uses the teacher’s global subjects.

## Required changes
### 1) Database
Add table:
- `teacher_class_subjects`
  - `teacher_id`
  - `class_name` (e.g., I..VII)
  - `subject_id`
  - unique `(teacher_id, class_name, subject_id)`

Update `server/config/db.js` to create the table (SQLite + MySQL).

### 2) Backend APIs
Add endpoints (auth: teacher):
- `GET /api/teachers/me/class-subjects?class=III`
  - returns subjects assigned to that teacher for the class
- `PUT /api/teachers/me/class-subjects`
  - body: `{ className, subjectIds }`
  - validates teacher + subject ids

Optional helper endpoints for UI:
- `GET /api/teachers/me/classes` (or reuse existing class dropdown logic)

### 3) Backend models/controllers
- Add methods in `server/models/Teacher.js` for `getClassSubjects()` and `setClassSubjects()`.
- Add controller(s) in `server/controllers/teacherController.js`.
- Add routes in `server/routes/teacherRoutes.js`.

### 4) UI (teacher portal)
In `client/css/js/teacher-portal.js`:
- when `classFilter` changes:
  - load `classSubjects` for that class
  - populate `subjectFilter` with only those subjects
- add a “Select subjects” multi-select modal or inline selector (manual subject selection).
  - After save, update subject dropdown for that class.

## Follow-up
- Ensure `student-register` validation stays compatible.
- Verify `saveResults` uses the subject selected for that class.

## Progress
- [x] Added DB table `teacher_class_subjects` to `server/config/db.js` (SQLite + MySQL)
- [ ] Add backend model/controller/routes for reading/writing class-specific subject assignments
- [ ] Update teacher-portal UI + logic to select subjects per selected class and save them



