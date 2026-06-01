const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../school_system.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database Error", err.message);
    } else {
        console.log("SQLite Connected");
        initializeTables();
    }
});

function initializeTables() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            subject_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (subject_id) REFERENCES subjects (id)
        )`,
        `CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            gender TEXT,
            class TEXT NOT NULL,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES teachers (id)
        )`,
        `CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_name TEXT UNIQUE NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            subject_id INTEGER NOT NULL,
            teacher_id INTEGER,
            marks REAL,
            grade TEXT,
            FOREIGN KEY (student_id) REFERENCES students (id),
            FOREIGN KEY (subject_id) REFERENCES subjects (id),
            FOREIGN KEY (teacher_id) REFERENCES teachers (id)
        )`,
        `CREATE TABLE IF NOT EXISTS teacher_subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_id INTEGER NOT NULL,
            subject_id INTEGER NOT NULL,
            FOREIGN KEY (teacher_id) REFERENCES teachers (id),
            FOREIGN KEY (subject_id) REFERENCES subjects (id),
            UNIQUE(teacher_id, subject_id)
        )`
    ];

    tables.forEach(sql => {
        db.run(sql, (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            }
        });
    });

    db.all("PRAGMA table_info(results)", (err, columns) => {
        if (err) {
            console.error("Error checking results table:", err.message);
            return;
        }

        const hasResultType = columns.some((column) => column.name === "result_type");
        if (!hasResultType) {
            db.run("ALTER TABLE results ADD COLUMN result_type TEXT DEFAULT 'terminal'", (alterErr) => {
                if (alterErr) {
                    console.error("Error adding result_type column:", alterErr.message);
                }
            });
        }
    });

    // Initialize default admin account
    const initAdmin = `
        INSERT OR IGNORE INTO admins (username, password) 
        VALUES (?, ?)
    `;
    const bcrypt = require("bcryptjs");
    bcrypt.hash("admin", 10, (err, hashedPassword) => {
        if (!err) {
            db.run(initAdmin, ["admin", hashedPassword], (err) => {
                if (err) {
                    console.error("Error initializing admin:", err.message);
                }
            });
        }
    });
}

module.exports = db;
