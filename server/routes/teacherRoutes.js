const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", adminMiddleware.authenticateAdmin, teacherController.getTeachers);
router.get("/me", authMiddleware.authenticate, teacherController.getMe);
router.get("/subjects", authMiddleware.authenticate, teacherController.getSubjects);
router.get("/me/standards", authMiddleware.authenticate, teacherController.getMeStandards);
router.put("/:teacherId/subject", adminMiddleware.authenticateAdmin, teacherController.assignSubjectToTeacher);
router.put("/subject", authMiddleware.authenticate, teacherController.assignSubject);


router.get("/:teacherId/standards", adminMiddleware.authenticateAdmin, teacherController.getTeacherStandardGroups);
router.put("/:teacherId/standards", adminMiddleware.authenticateAdmin, teacherController.setTeacherStandardGroups);
router.put("/:teacherId/standards/subjects", adminMiddleware.authenticateAdmin, teacherController.assignSubjectsByStandards);


module.exports = router;
