const { query } = require("../config/db");

const DEFAULT_RESULT_TYPE = "terminal";

const Results = {
    create: async (data) => {
        const sql = `
            INSERT INTO results (student_id, subject_id, teacher_id, marks, grade, result_type, academic_year)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await query(sql, [
            data.student_id,
            data.subject_id,
            data.teacher_id,
            data.marks,
            data.grade,
            data.result_type || DEFAULT_RESULT_TYPE,
            data.academic_year || new Date().getFullYear()
        ]);
        return { insertId: result.insertId };
    },

    findByStudentSubjectType: async (student_id, subject_id, result_type) => {
        const sql = "SELECT * FROM results WHERE student_id = ? AND subject_id = ? AND COALESCE(result_type, ?) = ?";
        return await query(sql, [student_id, subject_id, DEFAULT_RESULT_TYPE, result_type || DEFAULT_RESULT_TYPE]);
    },

    updateById: async (id, data) => {
        const sql = "UPDATE results SET teacher_id = ?, marks = ?, grade = ?, result_type = ?, academic_year = ? WHERE id = ?";
        await query(sql, [data.teacher_id, data.marks, data.grade, data.result_type || DEFAULT_RESULT_TYPE, data.academic_year, id]);
    },

    getByClassAndSubject: async (className, subjectId, resultType, academicYear) => {
        const sql = `
            SELECT
                students.id AS student_id,
                students.name AS student_name,
                students.class AS student_class,
                results.marks,
                results.grade,
                COALESCE(results.result_type, ?) AS result_type,
                results.academic_year
            FROM students
            LEFT JOIN results ON results.student_id = students.id
                AND results.subject_id = ?
                AND COALESCE(results.result_type, ?) = ?
                AND (results.academic_year = ? OR ? IS NULL)
            WHERE students.class = ?
            ORDER BY students.name
        `;
        const type = resultType || DEFAULT_RESULT_TYPE;
        return await query(sql, [DEFAULT_RESULT_TYPE, subjectId, DEFAULT_RESULT_TYPE, type, academicYear, academicYear, className]);
    },

    getByClassAndYear: async (className, academicYear, resultType) => {
        const sql = `
            SELECT
                students.id AS student_id,
                students.name AS student_name,
                students.class AS student_class,
                results.marks,
                results.grade,
                results.subject_id,
                COALESCE(results.result_type, ?) AS result_type,
                results.academic_year
            FROM students
            LEFT JOIN results ON results.student_id = students.id
                AND COALESCE(results.result_type, ?) = ?
                AND (results.academic_year = ? OR ? IS NULL)
            WHERE students.class = ?
            ORDER BY students.name
        `;
        const type = resultType || DEFAULT_RESULT_TYPE;
        return await query(sql, [DEFAULT_RESULT_TYPE, type, academicYear, academicYear, className]);
    },

    getAll: async () => {
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
                COALESCE(results.result_type, ?) AS result_type,
                results.academic_year
            FROM results
            JOIN students ON results.student_id = students.id
            JOIN subjects ON results.subject_id = subjects.id
            LEFT JOIN teachers ON results.teacher_id = teachers.id
            ORDER BY students.class, subjects.subject_name, results.result_type, students.name
        `;
        return await query(sql, [DEFAULT_RESULT_TYPE]);
    },

    getDistinctYears: async () => {
        const sql = `
            SELECT DISTINCT academic_year 
            FROM results 
            WHERE academic_year IS NOT NULL 
            ORDER BY academic_year DESC
        `;
        return await query(sql);
    },

    createOrUpdate: async (data) => {
        const existing = await Results.findByStudentSubjectType(data.student_id, data.subject_id, data.result_type);
        if (existing && existing.length > 0) {
            // Include academic_year in update
            data.academic_year = data.academic_year || existing[0].academic_year || new Date().getFullYear();
            await Results.updateById(existing[0].id, data);
            return { id: existing[0].id };
        } else {
            return await Results.create(data);
        }
    }
};

module.exports = Results;