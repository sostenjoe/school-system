const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const { query } = require("../config/db");

exports.getMe = async (req, res) => {
    try {
        const teacherId = req.teacher?.id;

        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized access." });
        }

        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found." });
        }

        res.json({
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            subject_id: teacher.subject_id
        });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.getAll();
        res.json(teachers);
    } catch (error) {
        console.error("Get teachers error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getSubjects = async (req, res) => {
    try {
        const teacherId = req.teacher?.id;

        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized access." });
        }

        const sql = `
            SELECT subjects.*
            FROM subjects
            JOIN teacher_subjects ON teacher_subjects.subject_id = subjects.id
            WHERE teacher_subjects.teacher_id = ?
        `;

        const subjects = await query(sql, [teacherId]);
        res.json(subjects || []);
    } catch (error) {
        // Fallback to all subjects if teacher_subjects table doesn't exist
        try {
            const subjects = await Subject.getAll();
            res.json(subjects);
        } catch (fallbackError) {
            console.error("Get subjects error:", fallbackError);
            res.status(500).json({ message: fallbackError.message });
        }
    }
};

exports.assignSubjectToTeacher = async (req, res) => {
    try {
        const teacherId = Number(req.params.teacherId);
        const subjectId = Number(req.body.subjectId);

        if (!teacherId || !subjectId) {
            return res.status(400).json({ message: "Teacher ID and Subject ID are required." });
        }

        const teacher = await query("SELECT id FROM teachers WHERE id = ?", [teacherId]);
        if (!teacher || teacher.length === 0) {
            return res.status(404).json({ message: "Teacher not found." });
        }

        const subject = await query("SELECT id FROM subjects WHERE id = ?", [subjectId]);
        if (!subject || subject.length === 0) {
            return res.status(404).json({ message: "Subject not found." });
        }

        // Delete existing assignments
        await query("DELETE FROM teacher_subjects WHERE teacher_id = ?", [teacherId]);

        // Insert new assignment
        await query(
            "INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)",
            [teacherId, subjectId]
        );

        // Update teacher's primary subject
        await Teacher.assignSubject(teacherId, subjectId);

        res.json({ message: "Subject assigned to teacher successfully." });
    } catch (error) {
        console.error("Assign subject to teacher error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.assignSubject = async (req, res) => {
    try {
        const teacherId = req.teacher?.id;
        const { subjectId } = req.body;

        if (!teacherId || !subjectId) {
            return res.status(400).json({ message: "Teacher ID and Subject ID required." });
        }

        // Update teacher's primary subject
        await Teacher.assignSubject(teacherId, subjectId);

        // Delete existing assignments
        await query("DELETE FROM teacher_subjects WHERE teacher_id = ?", [teacherId]);

        // Insert new assignment
        await query(
            "INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)",
            [teacherId, subjectId]
        );

        res.json({ message: "Subject assigned successfully" });
    } catch (error) {
        console.error("Assign subject error:", error);
        res.status(500).json({ message: error.message });
    }
};