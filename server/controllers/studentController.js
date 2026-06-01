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

exports.addStudentByTeacher = (req, res) => {
    const teacherId = req.teacher?.id;
    if (!teacherId) {
        return res.status(401).json({ message: "Unauthorized access." });
    }

    const { name, gender, class: className } = req.body;

    if (!name || !className) {
        return res.status(400).json({ message: "Name and class are required." });
    }

    Student.create(
        {
            name,
            gender: gender || "Not specified",
            class: className,
            created_by: teacherId
        },
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            res.json({
                message: "Student registered successfully",
                studentId: result.insertId
            });
        }
    );
};

exports.getStudents = (req, res) => {
    Student.getAll((err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};

exports.getStudentsByTeacher = (req, res) => {
    const teacherId = req.teacher?.id;
    if (!teacherId) {
        return res.status(401).json({ message: "Unauthorized access." });
    }

    Student.getByTeacher(teacherId, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        res.json(result || []);
    });
};