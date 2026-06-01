const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", adminMiddleware.authenticateAdmin, teacherController.getTeachers);
router.get("/me", authMiddleware.authenticate, teacherController.getMe);
router.get("/subjects", authMiddleware.authenticate, teacherController.getSubjects);
router.put("/:teacherId/subject", adminMiddleware.authenticateAdmin, teacherController.assignSubjectToTeacher);
router.put("/subject", authMiddleware.authenticate, teacherController.assignSubject);

module.exports = router;
