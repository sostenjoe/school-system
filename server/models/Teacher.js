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
        const teachers = await query(sql);
        
        // Get all subjects for each teacher from teacher_subjects junction table
        for (const teacher of teachers) {
            try {
                const subjectsSql = `
                    SELECT s.id, s.subject_name
                    FROM subjects s
                    JOIN teacher_subjects ts ON ts.subject_id = s.id
                    WHERE ts.teacher_id = ?
                `;
                const subjects = await query(subjectsSql, [teacher.id]);
                teacher.subjects = subjects || [];
            } catch (e) {
                // If teacher_subjects table doesn't exist, use the single subject
                teacher.subjects = teacher.subject_id ? [{ id: teacher.subject_id, subject_name: teacher.subject_name }] : [];
            }
        }
        
        return teachers;
    },

    updatePasswordByEmail: async (email, password) => {
        const sql = "UPDATE teachers SET password = ? WHERE email = ?";
        await query(sql, [password, email]);
    },

    assignSubject: async (teacherId, subjectId) => {
        const sql = "UPDATE teachers SET subject_id = ? WHERE id = ?";
        await query(sql, [subjectId, teacherId]);
    },

    // Assign multiple subjects to a teacher
    assignSubjects: async (teacherId, subjectIds) => {
        // Update the primary subject (first one)
        if (subjectIds && subjectIds.length > 0) {
            await query("UPDATE teachers SET subject_id = ? WHERE id = ?", [subjectIds[0], teacherId]);
            
            // Clear existing subject assignments
            await query("DELETE FROM teacher_subjects WHERE teacher_id = ?", [teacherId]);
            
            // Insert new subject assignments
            for (const subjectId of subjectIds) {
                await query(
                    "INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)",
                    [teacherId, subjectId]
                );
            }
        }
    },

    // Get all subjects assigned to a teacher
    getSubjects: async (teacherId) => {
        try {
            const sql = `
                SELECT s.id, s.subject_name
                FROM subjects s
                JOIN teacher_subjects ts ON ts.subject_id = s.id
                WHERE ts.teacher_id = ?
            `;
            const subjects = await query(sql, [teacherId]);
            return subjects || [];
        } catch (e) {
            // If teacher_subjects table doesn't exist, fall back to single subject
            const teacher = await query("SELECT subject_id FROM teachers WHERE id = ?", [teacherId]);
            if (teacher && teacher[0] && teacher[0].subject_id) {
                const subject = await query("SELECT id, subject_name FROM subjects WHERE id = ?", [teacher[0].subject_id]);
                return subject || [];
            }
            return [];
        }
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