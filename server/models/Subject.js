const { query } = require("../config/db");
const { DEFAULT_SUBJECTS } = require("../constants/subjects");

const defaultSubjectNames = DEFAULT_SUBJECTS.map((subject) => subject.toLowerCase());
const subjectPlaceholders = defaultSubjectNames.map(() => "?").join(", ");
const subjectOrderSql = defaultSubjectNames
    .map((_, index) => `WHEN ? THEN ${index}`)
    .join(" ");

async function ensureDefaultSubjects() {
    for (const subject of DEFAULT_SUBJECTS) {
        try {
            // Use INSERT OR IGNORE for SQLite compatibility
            await query("INSERT OR IGNORE INTO subjects (subject_name) VALUES (?)", [subject]);
        } catch (err) {
            console.error('Error ensuring default subject:', err.message);
        }
    }
}

const Subject = {
    create: async (data) => {
        const sql = "INSERT INTO subjects(subject_name) VALUES (?)";
        const result = await query(sql, [data.subject_name]);
        return { insertId: result.insertId };
    },

    getAll: async () => {
        await ensureDefaultSubjects();
        
        const sql = "SELECT id, subject_name FROM subjects ORDER BY subject_name";
        return await query(sql);
    }
};

module.exports = Subject;