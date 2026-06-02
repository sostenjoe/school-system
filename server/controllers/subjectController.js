const Subject = require("../models/Subject");

exports.addSubject = async (req, res) => {
    try {
        const result = await Subject.create(req.body);
        res.json({
            message: "Subject added successfully",
            id: result.insertId
        });
    } catch (error) {
        console.error("Add subject error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.getAll();
        res.json(Array.isArray(subjects) ? subjects : []);
    } catch (error) {
        console.error("Get subjects error:", error);
        res.status(500).json({ message: error.message });
    }
};