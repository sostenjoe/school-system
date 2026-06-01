const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/subject-performance", adminMiddleware.authenticateAdmin, analyticsController.getSubjectPerformance);
router.get("/teacher-performance", adminMiddleware.authenticateAdmin, analyticsController.getTeacherPerformance);
router.get("/class-performance", adminMiddleware.authenticateAdmin, analyticsController.getClassPerformance);
router.get("/underperforming", adminMiddleware.authenticateAdmin, analyticsController.getUnderperformingStudents);
router.get("/top-performers", adminMiddleware.authenticateAdmin, analyticsController.getTopPerformers);

module.exports = router;
