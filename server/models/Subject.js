const db = require("../config/db");
const { DEFAULT_SUBJECTS } = require("../constants/subjects");

const defaultSubjectNames = DEFAULT_SUBJECTS.map((subject) => subject.toLowerCase());
const subjectPlaceholders = defaultSubjectNames.map(() => "?").join(", ");
const subjectOrderSql = defaultSubjectNames
    .map((_, index) => `WHEN ? THEN ${index}`)
    .join(" ");

function ensureDefaultSubjects(callback) {
    let remaining = DEFAULT_SUBJECTS.length;
    let firstError = null;

    DEFAULT_SUBJECTS.forEach((subject) => {
        db.run("INSERT OR IGNORE INTO subjects (subject_name) VALUES (?)", [subject], (err) => {
            if (err && !firstError) {
                firstError = err;
            }

            remaining -= 1;
            if (remaining === 0) {
                callback(firstError);
            }
        });
    });
}

const Subject = {
    create: (data, callback) => {
        const query = "INSERT INTO subjects(subject_name) VALUES (?)";
        db.run(query, [data.subject_name], function(err) {
            callback(err, { insertId: this.lastID });
        });
    },

    getAll: (callback) => {
        ensureDefaultSubjects((err) => {
            if (err) {
                callback(err);
                return;
            }

            const query = `
                SELECT id, subject_name
                FROM subjects
                WHERE lower(subject_name) IN (${subjectPlaceholders})
                ORDER BY CASE lower(subject_name)
                    ${subjectOrderSql}
                    ELSE ${DEFAULT_SUBJECTS.length}
                END
            `;

            db.all(query, [...defaultSubjectNames, ...defaultSubjectNames], callback);
        });
    }
};

module.exports = Subject;
