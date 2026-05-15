const express = require("express");

const router =  express.Router();

const subjectController = require(
    "../controllers/subjectController"
);

router.post("/", subjectController.addSubject);

router.get("/", subjectController.getSubjects);

module.exports = router;
