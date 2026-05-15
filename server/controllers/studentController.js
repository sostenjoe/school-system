const { json } = require("express");
const Student = require("../models/Student");

exports.addStudent = (req, res) => {
    Student.create(req.body, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            message: "Student added successfully"
        });
    });
};

exports.getStudents = (req, res) => {
    Student.getAll((err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};