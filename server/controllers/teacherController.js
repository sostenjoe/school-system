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

exports.getMeStandards = async (req, res) => {
    try {
        const teacherId = req.teacher?.id;

        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized access." });
        }

        const standardGroups = await Teacher.getStandardGroups(Number(teacherId));
        res.json({ standardGroups });
    } catch (error) {
        console.error("Get me standards error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getSubjects = async (req, res) => {
    try {
        const teacherId = req.teacher?.id;

        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized access." });
        }

        // First try to get subjects from teacher_subjects junction table
        try {
            const sql = `
                SELECT subjects.*
                FROM subjects
                JOIN teacher_subjects ON teacher_subjects.subject_id = subjects.id
                WHERE teacher_subjects.teacher_id = ?
            `;

            const subjects = await query(sql, [teacherId]);
            res.json(Array.isArray(subjects) ? subjects : []);
        } catch (junctionError) {
            // If teacher_subjects table doesn't exist, fall back to teacher's subject_id
            const teacher = await Teacher.findById(teacherId);
            if (teacher && teacher.subject_id) {
                const sql = "SELECT * FROM subjects WHERE id = ?";
                const subjects = await query(sql, [teacher.subject_id]);
                res.json(Array.isArray(subjects) ? subjects : []);
            } else {
                // Return all subjects if teacher has no subject assigned
                const subjects = await Subject.getAll();
                res.json(Array.isArray(subjects) ? subjects : []);
            }
        }
    } catch (error) {
        console.error("Get subjects error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.assignSubjectToTeacher = async (req, res) => {
    try {
        const teacherId = Number(req.params.teacherId);
        // Support both single subjectId and array of subjectIds
        let subjectIds = req.body.subjectIds || req.body.subjectId;
        
        // Convert single value to array
        if (!Array.isArray(subjectIds)) {
            subjectIds = subjectIds ? [subjectIds] : [];
        }
        
        // Convert all to numbers
        subjectIds = subjectIds.map(id => Number(id));

        if (!teacherId) {
            return res.status(400).json({ message: "Teacher ID is required." });
        }

        if (!subjectIds || subjectIds.length === 0) {
            return res.status(400).json({ message: "At least one Subject ID is required." });
        }

        const teacher = await query("SELECT id FROM teachers WHERE id = ?", [teacherId]);
        if (!teacher || teacher.length === 0) {
            return res.status(404).json({ message: "Teacher not found." });
        }

        // Validate all subjects exist
        const placeholders = subjectIds.map(() => "?").join(",");
        const existingSubjects = await query(
            `SELECT id FROM subjects WHERE id IN (${placeholders})`,
            subjectIds
        );
        
        if (existingSubjects.length !== subjectIds.length) {
            return res.status(404).json({ message: "One or more subjects not found." });
        }

        // Assign multiple subjects using the Teacher model
        await Teacher.assignSubjects(teacherId, subjectIds);

        res.json({ message: "Subjects assigned to teacher successfully." });
    } catch (error) {
        console.error("Assign subject to teacher error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.assignSubject = async (req, res) => {
    try {
        const teacherId = req.teacher?.id;
        // Support both single subjectId and array of subjectIds
        let subjectIds = req.body.subjectIds || req.body.subjectId;

        // Convert single value to array
        if (!Array.isArray(subjectIds)) {
            subjectIds = subjectIds ? [subjectIds] : [];
        }

        // Convert all to numbers
        subjectIds = subjectIds.map(id => Number(id));

        if (!teacherId) {
            return res.status(400).json({ message: "Teacher ID is required." });
        }

        if (!subjectIds || subjectIds.length === 0) {
            return res.status(400).json({ message: "At least one Subject ID is required." });
        }

        // Assign multiple subjects using the Teacher model
        await Teacher.assignSubjects(teacherId, subjectIds);

        res.json({ message: "Subjects assigned successfully" });
    } catch (error) {
        console.error("Assign subject error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTeacherStandardGroups = async (req, res) => {
    try {
        const { teacherId } = req.params;
        if (!teacherId) return res.status(400).json({ message: "Teacher ID is required." });

        const standardGroups = await Teacher.getStandardGroups(Number(teacherId));
        res.json({ standardGroups });
    } catch (error) {
        console.error("Get teacher standard groups error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.setTeacherStandardGroups = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { standardGroups } = req.body;

        if (!teacherId) return res.status(400).json({ message: "Teacher ID is required." });

        await Teacher.setStandardGroups(Number(teacherId), standardGroups);
        res.json({ message: "Standard groups saved successfully." });
    } catch (error) {
        console.error("Set teacher standard groups error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.assignSubjectsByStandards = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { standardGroups } = req.body;

        if (!teacherId) return res.status(400).json({ message: "Teacher ID is required." });

        const groups = Array.isArray(standardGroups) ? standardGroups : [];
        if (groups.length === 0) {
            return res.status(400).json({ message: "Please select at least one standard group." });
        }

        // Save selections
        await Teacher.setStandardGroups(Number(teacherId), groups);

        // Assign subjects computed by intersection
        const allowedSubjectIds = await Teacher.setSubjectsByStandardGroups(Number(teacherId), groups);

        res.json({ message: "Subjects assigned based on standards successfully.", allowedSubjectIds });
    } catch (error) {
        console.error("Assign subjects by standards error:", error);
        res.status(500).json({ message: error.message });
    }
};

