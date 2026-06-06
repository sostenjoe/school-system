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

        // Enforce: teacher can only register students into classes allowed by their assigned standards.
        // In this project: students.class values are expected to be "I".."VII".
        // teacher_standard_ranges stores standard-group keys like "I-II", "III-IV", "V-VI", "VII".
        const { query } = require("../config/db");
        const { STANDARD_SUBJECTS } = require("../constants/standardSubjects");

        // Fetch teacher standard groups
        const groupsRows = await query(
            "SELECT standard_group FROM teacher_standard_ranges WHERE teacher_id = ?",
            [teacherId]
        );
        const groups = (groupsRows || []).map(r => r.standard_group);

        const normalizeClass = (c) => String(c || "").trim().toUpperCase();
        const allowedClasses = (() => {
            if (!groups || groups.length === 0) return null; // no standards assigned => allow all (backward compat)

            const expanded = [];
            for (const g of groups) {
                const key = normalizeClass(g);
                if (key === "I-II") expanded.push("I", "II");
                else if (key === "III-IV") expanded.push("III", "IV");
                else if (key === "V-VI") expanded.push("V", "VI");
                else if (key === "V-VII") expanded.push("V", "VI", "VII"); // backward compat
                else if (key === "VII") expanded.push("VII");
                else if (["I","II","III","IV","V","VI"].includes(key)) expanded.push(key);
            }
            return [...new Set(expanded)];
        })();

        const requestedClass = normalizeClass(className);
        if (allowedClasses && allowedClasses.length > 0 && !allowedClasses.includes(requestedClass)) {
            return res.status(403).json({
                message: `Teacher is not assigned to class ${requestedClass}. Allowed classes: ${allowedClasses.join(", ")}`
            });
        }

        const result = await Student.create({
            name,
            gender: gender || "Not specified",
            class: requestedClass,
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