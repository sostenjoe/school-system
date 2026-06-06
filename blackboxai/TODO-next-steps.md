## Next steps to implement standard-range UI + backend storage

1. Add DB table `teacher_standard_ranges` in `server/config/db.js` (SQLite + MySQL)
2. Add endpoints in `server/routes/teacherRoutes.js` + controllers:
   - GET `/api/teachers/:teacherId/standards` (admin only)
   - PUT `/api/teachers/:teacherId/standards` to set standard ranges
   - GET `/api/teachers/:teacherId/allowed-subjects?standard_key=` (optional helper)
3. Update `server/models/Teacher.js` with helpers to read/write `teacher_standard_ranges`
4. Update `client/css/js/pages/admin-settings.html` + `client/css/js/admin-settings.js`:
   - standard range selector (multi-select)
   - when teacher selected, load standards and auto-select allowed subjects
   - when standard selection changes, repopulate subject multi-select from `standardSubjects.js` mapping
5. Update `client/css/js/pages/admin-results.html`:
   - UI filters: standard I–VII, academic year (2026–2050), exam type
   - compute subject list from `standardSubjects.js` for selected standard
   - call `GET /api/results/class/:className/subject/:subjectId?result_type=...&academic_year=...`
   - if all subject results are empty → show “Results not ready yet”
6. Improve number animation smoothing (optional after logic works)

