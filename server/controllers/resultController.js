const db = require("../config/db");
const Result = require("../models/Results");
const calculateGrade = require("../utils/gradeCalculator");

exports.addResult = (req, res) => {
    const { student_id, subject_id, teacher_id, marks } = req.body;
    const authorId = req.teacher?.id || teacher_id;

    const grade = calculateGrade(marks);

    Result.create(
        {
            student_id,
            subject_id,
            teacher_id: authorId,
            marks,
            grade
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

    if (!Array.isArray(results) || results.length === 0) {
        return res.status(400).json({ message: "No result entries were provided." });
    }

    const entries = results.map((item) => ({
        student_id: item.student_id,
        subject_id: item.subject_id,
        teacher_id: authorId,
        marks: Number(item.marks),
        grade: calculateGrade(Number(item.marks))
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

    Result.getByClassAndSubject(className, subjectId, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};

exports.getSubmissionStatus = (req, res) => {
    const sql = `
      SELECT
        students.class AS class_name,
        subjects.subject_name,
        COALESCE(teachers.name, 'Unassigned') AS teacher_name,
        COUNT(DISTINCT students.id) AS total_students,
        COUNT(DISTINCT CASE WHEN results.id IS NOT NULL THEN students.id END) AS submitted_students,
        COUNT(DISTINCT students.id) - COUNT(DISTINCT CASE WHEN results.id IS NOT NULL THEN students.id END) AS missing_students
      FROM students
      CROSS JOIN subjects
      LEFT JOIN results ON results.student_id = students.id
        AND results.subject_id = subjects.id
      LEFT JOIN teachers ON results.teacher_id = teachers.id
      GROUP BY students.class, subjects.id, teachers.id, teacher_name
      ORDER BY students.class, subjects.subject_name, teacher_name
    `;

    db.all(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
};
