const db = require("../config/db");

const Teacher = {
    create: (data, callback) => {
        const sql = `
         INSERT INTO teachers (name, email, password, subject_id)
         VALUES (?, ?, ?, ?)
        `;
        db.run(sql, [data.name, data.email, data.password, data.subject_id || null], function(err) {
            callback(err, { insertId: this.lastID });
        });
    },

    findByEmail: (email, callback) => {
        const sql = "SELECT * FROM teachers WHERE email = ?";
        db.get(sql, [email], callback);
    },

    findById: (id, callback) => {
        const sql = "SELECT * FROM teachers WHERE id = ?";
        db.get(sql, [id], callback);
    },

    getAll: (callback) => {
        const sql = `
            SELECT t.id, t.name, t.email, t.subject_id, s.subject_name, t.created_at
            FROM teachers t
            LEFT JOIN subjects s ON t.subject_id = s.id
            ORDER BY t.name
        `;
        db.all(sql, callback);
    },

    updatePasswordByEmail: (email, password, callback) => {
        const sql = "UPDATE teachers SET password = ? WHERE email = ?";
        db.run(sql, [password, email], callback);
    },

    assignSubject: (teacherId, subjectId, callback) => {
        const sql = "UPDATE teachers SET subject_id = ? WHERE id = ?";
        db.run(sql, [subjectId, teacherId], callback);
    },

    getBySubject: (subjectId, callback) => {
        const sql = `
            SELECT t.id, t.name, t.email, s.subject_name
            FROM teachers t
            LEFT JOIN subjects s ON t.subject_id = s.id
            WHERE t.subject_id = ?
        `;
        db.all(sql, [subjectId], callback);
    }
};

module.exports = Teacher;
