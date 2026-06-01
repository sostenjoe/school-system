const db = require("../config/db");

const DEFAULT_RESULT_TYPE = "terminal";

const Results = {
    create: (data, callback) => {
        const sql = `
         INSERT INTO results (student_id, subject_id, teacher_id, marks, grade, result_type)
         VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.run(
            sql,
            [
                data.student_id,
                data.subject_id,
                data.teacher_id,
                data.marks,
                data.grade,
                data.result_type || DEFAULT_RESULT_TYPE
            ],
            function(err) {
            callback(err, { insertId: this.lastID });
            }
        );
    },

    findByStudentSubjectType: (student_id, subject_id, result_type, callback) => {
        const sql = "SELECT * FROM results WHERE student_id = ? AND subject_id = ? AND COALESCE(result_type, ?) = ?";
        db.all(sql, [student_id, subject_id, DEFAULT_RESULT_TYPE, result_type || DEFAULT_RESULT_TYPE], callback);
    },

    updateById: (id, data, callback) => {
        const sql = "UPDATE results SET teacher_id = ?, marks = ?, grade = ?, result_type = ? WHERE id = ?";
        db.run(sql, [data.teacher_id, data.marks, data.grade, data.result_type || DEFAULT_RESULT_TYPE, id], callback);
    },

    getByClassAndSubject: (className, subjectId, resultType, callback) => {
        const sql = `
          SELECT
            students.id AS student_id,
            students.name AS student_name,
            students.class AS student_class,
            results.marks,
            results.grade,
            COALESCE(results.result_type, ?) AS result_type
          FROM students
          LEFT JOIN results ON results.student_id = students.id
            AND results.subject_id = ?
            AND COALESCE(results.result_type, ?) = ?
          WHERE students.class = ?
          ORDER BY students.name
        `;
        const type = resultType || DEFAULT_RESULT_TYPE;
        db.all(sql, [DEFAULT_RESULT_TYPE, subjectId, DEFAULT_RESULT_TYPE, type, className], callback);
    },

    getAll: (callback) => {
        const sql = `
        SELECT
          results.id,
          results.teacher_id,
          students.name AS student_name,
          students.class AS student_class,
          subjects.subject_name,
          teachers.name AS teacher_name,
          results.marks,
          results.grade,
          COALESCE(results.result_type, ?) AS result_type
        FROM results
        JOIN students ON results.student_id = students.id
        JOIN subjects ON results.subject_id = subjects.id
        LEFT JOIN teachers ON results.teacher_id = teachers.id
        ORDER BY students.class, subjects.subject_name, results.result_type, students.name
        `;
        db.all(sql, [DEFAULT_RESULT_TYPE], callback);
    },

    createOrUpdate: (data, callback) => {
        Results.findByStudentSubjectType(data.student_id, data.subject_id, data.result_type, (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result && result.length > 0) {
                const existing = result[0];
                Results.updateById(existing.id, data, callback);
            } else {
                Results.create(data, callback);
            }
        });
    }
};

module.exports = Results;

