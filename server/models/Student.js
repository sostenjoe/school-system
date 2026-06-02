const { query } = require("../config/db");

const Student = {
    create: async (data) => {
        const sql = `
            INSERT INTO students (name, gender, class, created_by)
            VALUES (?, ?, ?, ?)
        `;
        const result = await query(sql, [data.name, data.gender, data.class, data.created_by || null]);
        return { insertId: result.insertId };
    },

    getAll: async () => {
        return await query("SELECT * FROM students");
    },

    getByTeacher: async (teacherId) => {
        const sql = `
            SELECT * FROM students 
            WHERE created_by = ?
            ORDER BY name ASC
        `;
        return await query(sql, [teacherId]);
    },

    getByClass: async (className) => {
        const sql = "SELECT * FROM students WHERE class = ? ORDER BY name ASC";
        return await query(sql, [className]);
    }
};

module.exports = Student;