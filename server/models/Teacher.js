const { query } = require("../config/db");

const Teacher = {
    create: async (data) => {
        const sql = `
            INSERT INTO teachers (name, email, password, subject_id)
            VALUES (?, ?, ?, ?)
        `;
        const result = await query(sql, [data.name, data.email, data.password, data.subject_id || null]);
        return { insertId: result.insertId };
    },

    findByEmail: async (email) => {
        const sql = "SELECT * FROM teachers WHERE email = ?";
        const rows = await query(sql, [email]);
        return rows[0] || null;
    },

    findById: async (id) => {
        const sql = "SELECT * FROM teachers WHERE id = ?";
        const rows = await query(sql, [id]);
        return rows[0] || null;
    },

    getAll: async () => {
        const sql = `
            SELECT t.id, t.name, t.email, t.subject_id, s.subject_name, t.created_at
            FROM teachers t
            LEFT JOIN subjects s ON t.subject_id = s.id
            ORDER BY t.name
        `;
        return await query(sql);
    },

    updatePasswordByEmail: async (email, password) => {
        const sql = "UPDATE teachers SET password = ? WHERE email = ?";
        await query(sql, [password, email]);
    },

    assignSubject: async (teacherId, subjectId) => {
        const sql = "UPDATE teachers SET subject_id = ? WHERE id = ?";
        await query(sql, [subjectId, teacherId]);
    },

    getBySubject: async (subjectId) => {
        const sql = `
            SELECT t.id, t.name, t.email, s.subject_name
            FROM teachers t
            LEFT JOIN subjects s ON t.subject_id = s.id
            WHERE t.subject_id = ?
        `;
        return await query(sql, [subjectId]);
    }
};

module.exports = Teacher;