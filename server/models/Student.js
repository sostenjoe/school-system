const db = require("../config/db");

const Student = {
    create: (data, callback) => {
        const sql = `
         INSERT INTO students (name, gender, class, created_by)
         VALUES (?, ?, ?, ?)
        `;
        db.run(sql, [data.name, data.gender, data.class, data.created_by || null], function(err) {
            callback(err, { insertId: this.lastID });
        });
    },

    getAll: (callback) => {
        db.all("SELECT * FROM students", callback);
    },

    getByTeacher: (teacherId, callback) => {
        const sql = `
            SELECT * FROM students 
            WHERE created_by = ?
            ORDER BY name ASC
        `;
        db.all(sql, [teacherId], callback);
    },

    getByClass: (className, callback) => {
        const sql = "SELECT * FROM students WHERE class = ? ORDER BY name ASC";
        db.all(sql, [className], callback);
    }
};

module.exports = Student;
        
