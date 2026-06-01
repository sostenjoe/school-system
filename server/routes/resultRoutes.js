const express = require("express");

const router = express.Router();

const resultController = require(
    "../controllers/resultController"
);
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware.authenticate, resultController.addResult);
router.post("/batch", authMiddleware.authenticate, resultController.addBatchResults);
router.get("/", resultController.getResults);
router.get("/teacher", authMiddleware.authenticate, resultController.getTeacherResults);
router.get("/class-summary", resultController.getClassSummary);
router.get("/class/:className/subject/:subjectId", authMiddleware.authenticate, resultController.getResultsByClassSubject);
router.get("/status", resultController.getSubmissionStatus);

module.exports = router;
