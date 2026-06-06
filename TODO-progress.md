# TODO Progress

- [x] Plan confirmation: update DB schema + APIs + admin UI

- [x] Update DB initialization (`server/config/db.js`) to create `teacher_standard_ranges`

- [ ] Update `server/models/Teacher.js` to read/write assigned standard ranges
- [ ] Update `server/controllers/teacherController.js` to support assigning ranges (admin) and fetching allowed subjects by teacher/range
- [ ] Update `client/css/js/pages/admin-settings.html` + `client/css/js/admin-settings.js` to add standard range selector and limit subjects by range
- [ ] Update `client/css/js/pages/admin-results.html` to add filters: standard I–VII, academic year (2026–2050), exam type
- [ ] Update `client/css/js/pages/admin-results.html` fetch logic to:
  - [ ] build subject list from standardSubjects.js range
  - [ ] fetch results with `academic_year` + `result_type`
  - [ ] show “Results not ready yet” if no submissions for selected year/exam
- [ ] Improve number animation (smoother start, avoid rounding jumps)
- [ ] Quick runtime check: load admin-settings/admin-results in browser and verify flows

