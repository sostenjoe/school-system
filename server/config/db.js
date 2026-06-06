const { DEFAULT_SUBJECTS } = require("../constants/subjects");
const { STANDARD_SUBJECTS } = require("../constants/standardSubjects");


// Determine which database to use based on NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';

let dbModule;

if (isProduction && process.env.DB_HOST) {
    // Use MySQL for production
    const mysql = require('mysql2/promise');
    
    let pool;

    async function connectDB() {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'school_system',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };

        try {
            pool = mysql.createPool(config);
            
            // Test connection
            const connection = await pool.getConnection();
            console.log('MySQL Connected Successfully');
            connection.release();
            
            // Initialize tables
            await initializeTables();
            
            return pool;
        } catch (err) {
            console.error('MySQL Connection Error:', err.message);
            throw err;
        }
    }

    async function initializeTables() {
        const connection = await pool.getConnection();
        
        try {
            // Create tables (MySQL syntax)
            const tables = [
                `CREATE TABLE IF NOT EXISTS admins (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
                
                `CREATE TABLE IF NOT EXISTS teachers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    subject_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
                
                `CREATE TABLE IF NOT EXISTS students (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    gender ENUM('Male', 'Female', 'Other'),
                    class VARCHAR(50) NOT NULL,
                    created_by INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES teachers (id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
                
                `CREATE TABLE IF NOT EXISTS subjects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    subject_name VARCHAR(255) UNIQUE NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
                
                `CREATE TABLE IF NOT EXISTS results (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    subject_id INT NOT NULL,
                    teacher_id INT,
                    marks DECIMAL(5,2),
                    grade VARCHAR(2),
                    result_type VARCHAR(50) DEFAULT 'terminal',
                    academic_year INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
                    FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
                    FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
                
                `CREATE TABLE IF NOT EXISTS teacher_subjects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    teacher_id INT NOT NULL,
                    subject_id INT NOT NULL,
                    FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE,
                    FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
                    UNIQUE KEY unique_teacher_subject (teacher_id, subject_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

                `CREATE TABLE IF NOT EXISTS teacher_standard_ranges (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    teacher_id INT NOT NULL,
                    standard_group VARCHAR(10) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE,
                    UNIQUE KEY unique_teacher_standard (teacher_id, standard_group)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
            ];

            for (const sql of tables) {
                await connection.execute(sql);
            }

            // Initialize default admin account
            const bcrypt = require("bcryptjs");
            const hashedPassword = bcrypt.hashSync("admin", 10);
            
            try {
                await connection.execute(
                    'INSERT IGNORE INTO admins (username, password) VALUES (?, ?)',
                    ['admin', hashedPassword]
                );
            } catch (err) {
                console.error('Error initializing admin:', err.message);
            }

            // Initialize default subjects (includes Standard I–VII mapped subjects)
            const allSubjectsToSeed = new Set(
                [...DEFAULT_SUBJECTS, ...STANDARD_SUBJECTS["I-II"], ...STANDARD_SUBJECTS["III-IV"], ...STANDARD_SUBJECTS["V-VII"]]
            );

            for (const subject of allSubjectsToSeed) {
                try {
                    await connection.execute(
                        'INSERT IGNORE INTO subjects (subject_name) VALUES (?)',
                        [subject]
                    );
                } catch (err) {
                    console.error('Error initializing subject:', err.message);
                }
            }

            console.log('Database tables initialized successfully');
            

            
        } catch (err) {
            console.error('Error initializing tables:', err.message);
            throw err;
        } finally {
            connection.release();
        }
    }

    async function query(sql, params) {
        const [rows] = await pool.execute(sql, params);
        return rows;
    }

    // Graceful shutdown
    process.on('SIGINT', async () => {
        if (pool) {
            await pool.end();
            console.log('MySQL connection closed');
            process.exit(0);
        }
    });

    dbModule = {
        connectDB,
        query,
        getPool: () => pool
    };
} else {
    // Use SQLite for development
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const bcrypt = require("bcryptjs");
    
    const dbPath = path.join(process.cwd(), 'school_system.db');
            const db = new sqlite3.Database(dbPath);

    function runAsync(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ insertId: this.lastID, changes: this.changes });
            });
        });
    }


    async function connectDB() {
        return new Promise((resolve, reject) => {
            db.serialize(async () => {
                try {
                    await initializeTables();
                    console.log('SQLite Connected (Development Mode)');
                    resolve(db);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    async function initializeTables() {
        return new Promise((resolve, reject) => {
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
                    FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL
                )`,
                
                `CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    gender TEXT,
                    class TEXT NOT NULL,
                    created_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES teachers (id) ON DELETE SET NULL
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
                    result_type TEXT DEFAULT 'terminal',
                    academic_year INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
                    FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
                    FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE SET NULL
                )`,
                
                `CREATE TABLE IF NOT EXISTS teacher_subjects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    teacher_id INTEGER NOT NULL,
                    subject_id INTEGER NOT NULL,
                    FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE,
                    FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
                    UNIQUE (teacher_id, subject_id)
                )`,

                `CREATE TABLE IF NOT EXISTS teacher_standard_ranges (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    teacher_id INTEGER NOT NULL,
                    standard_group TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE,
                    UNIQUE (teacher_id, standard_group)
                )`
            ];

            let completed = 0;
            const total = tables.length;

            tables.forEach(sql => {
                db.run(sql, (err) => {
                    if (err) {
                        console.error('Error creating table:', err.message);
                    }
                    completed++;
                    if (completed === total) {
                        initializeDefaults().then(resolve).catch(reject);
                    }
                });
            });
        });
    }

    async function initializeDefaults() {
        return new Promise((resolve, reject) => {
            // Initialize default admin
            const hashedPassword = bcrypt.hashSync("admin", 10);
            db.run(
                'INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)',
                ['admin', hashedPassword],
                (err) => {
                    if (err) console.error('Error initializing admin:', err.message);
                    
                    // Initialize default subjects
                    let completed = 0;
                    const total = DEFAULT_SUBJECTS.length;
                    
                    DEFAULT_SUBJECTS.forEach(subject => {
                        db.run(
                            'INSERT OR IGNORE INTO subjects (subject_name) VALUES (?)',
                            [subject],
                            (err) => {
                                if (err) console.error('Error initializing subject:', err.message);
                                completed++;
                                if (completed === total) {
                                    console.log('Database tables initialized successfully');
                                    resolve();
                                }
                            }
                        );
                    });
                }
            );
        });
    }

    async function query(sql, params = []) {
        return new Promise((resolve, reject) => {
            const trimmedSql = sql.trim().toUpperCase();
            if (trimmedSql.startsWith('SELECT')) {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            } else {
                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve({ insertId: this.lastID, changes: this.changes });
                });
            }
        });
    }

    // Graceful shutdown
    process.on('SIGINT', (callback) => {
        db.close((err) => {
            if (err) console.error('Error closing SQLite:', err.message);
            console.log('SQLite connection closed');
            if (callback) callback();
        });
    });

    dbModule = {
        connectDB,
        query,
        getDb: () => db
    };
}

module.exports = dbModule;