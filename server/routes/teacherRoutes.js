const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware.authenticate, teacherController.getMe);
router.get("/subjects", authMiddleware.authenticate, teacherController.getSubjects);

module.exports = router;
