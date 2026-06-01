const db = require("../config/db");
const Result = require("../models/Results");
const calculateGrade = require("../utils/gradeCalculator");

const allowedResultTypes = new Set(["mid_term", "end_term", "terminal", "assignment", "exam"]);

function normalizeResultType(value) {
    const type = String(value || "terminal").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
    return allowedResultTypes.has(type) ? type : "terminal";
}

exports.addResult = (req, res) => {
    const { student_id, subject_id, teacher_id, marks } = req.body;
    const authorId = req.teacher?.id || teacher_id;
    const result_type = normalizeResultType(req.body.result_type);

    const grade = calculateGrade(marks);

    Result.create(
        {
            student_id,
            subject_id,
            teacher_id: authorId,
            marks,
            grade,
            result_type
        },
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: "Result added successfully" });
        }
    );
};

exports.addBatchResults = async (req, res) => {
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

    try {
        await Promise.all(
            entries.map(
                (entry) =>
                    new Promise((resolve, reject) => {
                        Result.createOrUpdate(entry, (err) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve();
                        });
                    })
            )
        );
        res.json({ message: "Batch results submitted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message || "Unable to save batch results." });
    }
};

exports.getResults = (req, res) => {
    Result.getAll((err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};

exports.getTeacherResults = (req, res) => {
    const teacherId = req.teacher?.id;

    if (!teacherId) {
        return res.status(401).json({ message: "Unauthorized access." });
    }

    Result.getAll((err, allResults) => {
        if (err) {
            return res.status(500).json(err);
        }

        const teacherResults = allResults.filter((result) => result.teacher_id === teacherId);
        res.json(teacherResults);
    });
};

exports.getResultsByClassSubject = (req, res) => {
    const { className, subjectId } = req.params;
    const resultType = normalizeResultType(req.query.result_type);

    Result.getByClassAndSubject(className, subjectId, resultType, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};

exports.getClassSummary = (req, res) => {
    const sql = `
      WITH class_totals AS (
        SELECT class AS class_name, COUNT(*) AS total_students
        FROM students
        GROUP BY class
      ),
      result_stats AS (
        SELECT
          students.class AS class_name,
          COALESCE(results.result_type, 'terminal') AS result_type,
          COUNT(results.id) AS submitted_results,
          ROUND(AVG(results.marks), 2) AS average_marks,
          MIN(results.marks) AS lowest_marks,
          MAX(results.marks) AS highest_marks,
          COUNT(CASE WHEN results.marks >= 70 THEN 1 END) AS passing_results,
          COUNT(CASE WHEN results.marks < 50 THEN 1 END) AS underperforming_results
        FROM students
        JOIN results ON results.student_id = students.id
        GROUP BY students.class, COALESCE(results.result_type, 'terminal')
      )
      SELECT
        class_totals.class_name,
        COALESCE(result_stats.result_type, 'terminal') AS result_type,
        class_totals.total_students,
        COALESCE(result_stats.submitted_results, 0) AS submitted_results,
        result_stats.average_marks,
        result_stats.lowest_marks,
        result_stats.highest_marks,
        COALESCE(result_stats.passing_results, 0) AS passing_results,
        COALESCE(result_stats.underperforming_results, 0) AS underperforming_results
      FROM class_totals
      LEFT JOIN result_stats ON result_stats.class_name = class_totals.class_name
      ORDER BY class_totals.class_name, result_type
    `;

    db.all(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        res.json(result || []);
    });
};

exports.getSubmissionStatus = (req, res) => {
    const sql = `
      SELECT
        students.class AS class_name,
        subjects.subject_name,
        COALESCE(results.result_type, 'terminal') AS result_type,
        COALESCE(teachers.name, 'Unassigned') AS teacher_name,
        COUNT(DISTINCT students.id) AS total_students,
        COUNT(DISTINCT CASE WHEN results.id IS NOT NULL THEN students.id END) AS submitted_students,
        COUNT(DISTINCT students.id) - COUNT(DISTINCT CASE WHEN results.id IS NOT NULL THEN students.id END) AS missing_students
      FROM students
      CROSS JOIN subjects
      LEFT JOIN results ON results.student_id = students.id
        AND results.subject_id = subjects.id
      LEFT JOIN teachers ON results.teacher_id = teachers.id
      GROUP BY students.class, subjects.id, result_type, teachers.id, teacher_name
      ORDER BY students.class, subjects.subject_name, result_type, teacher_name
    `;

    db.all(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
};
