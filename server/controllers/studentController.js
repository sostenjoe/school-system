const Student = require("../models/Student");

exports.addStudent = async (req, res) => {
    try {
        await Student.create(req.body);
        res.json({ message: "Student added successfully" });
    } catch (error) {
        console.error("Add student error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.addStudentByTeacher = async (req, res) => {
    try {
        const teacherId = req.teacher?.id;
        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized access." });
        }

        const { name, gender, class: className } = req.body;

        if (!name || !className) {
            return res.status(400).json({ message: "Name and class are required." });
        }

        const result = await Student.create({
            name,
            gender: gender || "Not specified",
            class: className,
            created_by: teacherId
        });

        res.json({
            message: "Student registered successfully",
            studentId: result.insertId
        });
    } catch (error) {
        console.error("Add student by teacher error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.getAll();
        res.json(students);
    } catch (error) {
        console.error("Get students error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentsByTeacher = async (req, res) => {
    try {
        const teacherId = req.teacher?.id;
        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized access." });
        }

        const students = await Student.getByTeacher(teacherId);
        res.json(students || []);
    } catch (error) {
        console.error("Get students by teacher error:", error);
        res.status(500).json({ message: error.message });
    }
};