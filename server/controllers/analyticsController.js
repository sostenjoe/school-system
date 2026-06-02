const db = require("../config/db");

exports.getSubjectPerformance = async (req, res) => {
    try {
        const sql = `
            SELECT 
                subjects.id,
                subjects.subject_name,
                COUNT(DISTINCT results.student_id) as students_with_results,
                AVG(results.marks) as average_marks,
                MIN(results.marks) as min_marks,
                MAX(results.marks) as max_marks,
                COUNT(CASE WHEN results.marks >= 70 THEN 1 END) as passing_count,
                COUNT(CASE WHEN results.marks < 70 THEN 1 END) as failing_count
            FROM subjects
            LEFT JOIN results ON subjects.id = results.subject_id
            GROUP BY subjects.id, subjects.subject_name
            ORDER BY average_marks DESC
        `;

        const result = await db.query(sql);
        res.json(result || []);
    } catch (error) {
        console.error("Get subject performance error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTeacherPerformance = async (req, res) => {
    try {
        const sql = `
            SELECT 
                teachers.id,
                teachers.name as teacher_name,
                subjects.subject_name,
                COUNT(DISTINCT results.student_id) as students_taught,
                AVG(results.marks) as average_marks,
                COUNT(CASE WHEN results.marks >= 70 THEN 1 END) as passing_students,
                COUNT(CASE WHEN results.marks < 70 THEN 1 END) as underperforming_students
            FROM teachers
            LEFT JOIN subjects ON teachers.subject_id = subjects.id
            LEFT JOIN results ON teachers.id = results.teacher_id
            GROUP BY teachers.id, teachers.name, subjects.subject_name
            ORDER BY average_marks DESC
        `;

        const result = await db.query(sql);
        res.json(result || []);
    } catch (error) {
        console.error("Get teacher performance error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getClassPerformance = async (req, res) => {
    try {
        const sql = `
            SELECT 
                students.class,
                COUNT(DISTINCT students.id) as total_students,
                COUNT(DISTINCT results.id) as results_submitted,
                AVG(results.marks) as average_marks,
                COUNT(CASE WHEN results.marks >= 70 THEN 1 END) as passing_students
            FROM students
            LEFT JOIN results ON students.id = results.student_id
            GROUP BY students.class
            ORDER BY average_marks DESC
        `;

        const result = await db.query(sql);
        res.json(result || []);
    } catch (error) {
        console.error("Get class performance error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getUnderperformingStudents = async (req, res) => {
    try {
        const threshold = req.query.threshold || 50;
        
        const sql = `
            SELECT 
                students.id,
                students.name,
                students.class,
                subjects.subject_name,
                COALESCE(results.result_type, 'terminal') AS result_type,
                results.marks,
                results.grade,
                teachers.name as teacher_name
            FROM students
            JOIN results ON students.id = results.student_id
            JOIN subjects ON results.subject_id = subjects.id
            LEFT JOIN teachers ON results.teacher_id = teachers.id
            WHERE results.marks < ?
            ORDER BY results.marks ASC, students.class ASC
        `;

        const result = await db.query(sql, [threshold]);
        res.json(result || []);
    } catch (error) {
        console.error("Get underperforming students error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTopPerformers = async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        
        const sql = `
            SELECT 
                students.id,
                students.name,
                students.class,
                subjects.subject_name,
                COALESCE(results.result_type, 'terminal') AS result_type,
                results.marks,
                results.grade,
                teachers.name as teacher_name
            FROM students
            JOIN results ON students.id = results.student_id
            JOIN subjects ON results.subject_id = subjects.id
            LEFT JOIN teachers ON results.teacher_id = teachers.id
            ORDER BY results.marks DESC
            LIMIT ?
        `;

        const result = await db.query(sql, [limit]);
        res.json(result || []);
    } catch (error) {
        console.error("Get top performers error:", error);
        res.status(500).json({ message: error.message });
    }
};