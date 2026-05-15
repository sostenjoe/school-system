const db = require("../config/db");

const Results = {
    create: (data, callback) => {
        const sql = `
         INSERT INTO results (student_id, subject_id, teacher_id, marks, grade)
         VALUES (?, ?, ?, ?, ?)
        `;
        db.run(sql, [data.student_id, data.subject_id, data.teacher_id, data.marks, data.grade], function(err) {
            callback(err, { insertId: this.lastID });
        });
    },

    findByStudentSubject: (student_id, subject_id, callback) => {
        const sql = "SELECT * FROM results WHERE student_id = ? AND subject_id = ?";
        db.all(sql, [student_id, subject_id], callback);
    },

    updateById: (id, data, callback) => {
        const sql = "UPDATE results SET teacher_id = ?, marks = ?, grade = ? WHERE id = ?";
        db.run(sql, [data.teacher_id, data.marks, data.grade, id], callback);
    },

    getByClassAndSubject: (className, subjectId, callback) => {
        const sql = `
          SELECT
            students.id AS student_id,
            students.name AS student_name,
            students.class AS student_class,
            results.marks,
            results.grade
          FROM students
          LEFT JOIN results ON results.student_id = students.id
            AND results.subject_id = ?
          WHERE students.class = ?
        `;
        db.all(sql, [subjectId, className], callback);
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
          results.grade
        FROM results
        JOIN students ON results.student_id = students.id
        JOIN subjects ON results.subject_id = subjects.id
        LEFT JOIN teachers ON results.teacher_id = teachers.id
        `;
        db.all(sql, callback);
    },

    createOrUpdate: (data, callback) => {
        Results.findByStudentSubject(data.student_id, data.subject_id, (err, result) => {
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

