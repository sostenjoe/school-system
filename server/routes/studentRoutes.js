const express = require("express");

const router =  express.Router();

const studentController = require(
    "../controllers/studentController"
);
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", studentController.addStudent);

router.get("/", studentController.getStudents);

router.post("/register", authMiddleware.authenticate, studentController.addStudentByTeacher);

router.get("/by-teacher", authMiddleware.authenticate, studentController.getStudentsByTeacher);

module.exports = router;
