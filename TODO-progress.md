# TODO Progress

- [x] Understand repo structure and existing flows (auth, teachers, students, subjects, results, analytics)
- [x] Diagnose email configuration handling and improve `server/utils/emailService.js`
- [x] Add initial implementation plan to `TODO.md`
- [ ] Step 1: Implement Standard I–VII subject mapping + seed/ensure required subjects exist in DB
- [ ] Step 2: Add admin-only “general results” ranked API filtered by Standard + Exam type + academic year
- [ ] Step 3: Update `client/css/js/pages/admin-results.html` UI to include Standard + Exam type + Year, and render table with per-subject totals/avg/grade + position
- [ ] Step 4: Implement admin-controlled assignment of subjects-to-teachers and scope teachers to allowed standards/classes
- [ ] Step 5: Test end-to-end (`npm run dev` + verify filters + ranking + assignment)

