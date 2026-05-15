const db = require("../config/db");

const Student = {
    create: (data, callback) => {
        const sql = `
         INSERT INTO students (name, gender, class)
         VALUES (?, ?, ?)
        `;
        db.run(sql, [data.name, data.gender, data.class], function(err) {
            callback(err, { insertId: this.lastID });
        });
    },

    getAll: (callback) => {
        db.all("SELECT * FROM students", callback);
    }
};

module.exports = Student;
        
