const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/login", adminController.loginAdmin);
router.get("/me", adminMiddleware.authenticateAdmin, adminController.getAdminProfile);
router.put("/credentials", adminMiddleware.authenticateAdmin, adminController.updateCredentials);

module.exports = router;
