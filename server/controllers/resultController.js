const { query } = require("../config/db");
const Result = require("../models/Results");
const calculateGrade = require("../utils/gradeCalculator");

const allowedResultTypes = new Set(["mid_term", "end_term", "terminal", "assignment", "exam"]);

function normalizeResultType(value) {
    const type = String(value || "terminal").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
    return allowedResultTypes.has(type) ? type : "terminal";
}

exports.addResult = async (req, res) => {
    try {
        const { student_id, subject_id, teacher_id, marks } = req.body;
        const authorId = req.teacher?.id || teacher_id;
        const result_type = normalizeResultType(req.body.result_type);

        const grade = calculateGrade(marks);

        await Result.create({
            student_id,
            subject_id,
            teacher_id: authorId,
            marks,
            grade,
            result_type
        });

        res.json({ message: "Result added successfully" });
    } catch (error) {
        console.error("Add result error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.addBatchResults = async (req, res) => {
    try {
        const { results } = req.body;
        const authorId = req.teacher?.id;
        const result_type = normalizeResultType(req.body.result_type);

        if (!Array.isArray(results) || results.length === 0) {
            return res.status(400).json({ message: "No result entries were provided." });
        }

        const entries = results.map((item) => ({
            student_id: item.student_id,
            subject_id: item.subject_id,
            teacher_id: authorId,
            marks: Number(item.marks),
            grade: calculateGrade(Number(item.marks)),
            result_type
        }));

        for (const entry of entries) {
            await Result.createOrUpdate(entry);
        }

        res.json({ message: "Batch results submitted successfully." });
    } catch (error) {
        console.error("Batch results error:", error);
        res.status(500).json({ error: error.message || "Unable to save batch results." });
    }
};

exports.getResults = async (req, res) => {
    try {
        const results = await Result.getAll();
        res.json(results);
    } catch (error) {
        console.error("Get results error:", error);
        res.status(500).json(error);
    }
};

exports.getTeacherResults = async (req, res) => {
    try {
        const teacherId = req.teacher?.id;

        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized access." });
        }

        const allResults = await Result.getAll();
        const teacherResults = allResults.filter((result) => result.teacher_id === teacherId);
        res.json(teacherResults);
    } catch (error) {
        console.error("Get teacher results error:", error);
        res.status(500).json(error);
    }
};

exports.getResultsByClassSubject = async (req, res) => {
    try {
        const { className, subjectId } = req.params;
        const resultType = normalizeResultType(req.query.result_type);

        const results = await Result.getByClassAndSubject(className, subjectId, resultType);
        res.json(results);
    } catch (error) {
        console.error("Get results by class/subject error:", error);
        res.status(500).json(error);
    }
};

exports.getClassSummary = async (req, res) => {
    try {
        const sql = `
            SELECT
                s.class AS class_name,
                COALESCE(r.result_type, 'terminal') AS result_type,
                COUNT(DISTINCT s.id) AS total_students,
                COUNT(r.id) AS submitted_results,
                ROUND(AVG(r.marks), 2) AS average_marks,
                MIN(r.marks) AS lowest_marks,
                MAX(r.marks) AS highest_marks,
                COUNT(CASE WHEN r.marks >= 70 THEN 1 END) AS passing_results,
                COUNT(CASE WHEN r.marks < 50 THEN 1 END) AS underperforming_results
            FROM students s
            LEFT JOIN results r ON r.student_id = s.id
            GROUP BY s.class, COALESCE(r.result_type, 'terminal')
            ORDER BY s.class, result_type
        `;

        const results = await query(sql);
        res.json(results || []);
    } catch (error) {
        console.error("Get class summary error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getSubmissionStatus = async (req, res) => {
    try {
        const sql = `
            SELECT
                s.class AS class_name,
                sub.subject_name,
                COALESCE(r.result_type, 'terminal') AS result_type,
                COALESCE(t.name, 'Unassigned') AS teacher_name,
                COUNT(DISTINCT s.id) AS total_students,
                COUNT(DISTINCT CASE WHEN r.id IS NOT NULL THEN s.id END) AS submitted_students,
                COUNT(DISTINCT s.id) - COUNT(DISTINCT CASE WHEN r.id IS NOT NULL THEN s.id END) AS missing_students
            FROM students s
            CROSS JOIN subjects sub
            LEFT JOIN results r ON r.student_id = s.id
                AND r.subject_id = sub.id
            LEFT JOIN teachers t ON r.teacher_id = t.id
            GROUP BY s.class, sub.id, COALESCE(r.result_type, 'terminal'), t.id, t.name
            ORDER BY s.class, sub.subject_name, result_type, t.name
        `;

        const results = await query(sql);
        res.json(results);
    } catch (error) {
        console.error("Get submission status error:", error);
        res.status(500).json(error);
    }
};