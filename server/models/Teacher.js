const db = require("../config/db");

const Teacher = {
    create: (data, callback) => {
        const sql = `
         INSERT INTO teachers (name, email, password)
         VALUES (?, ?, ?)
        `;
        db.run(sql, [data.name, data.email, data.password], function(err) {
            callback(err, { insertId: this.lastID });
        });
    },

    findByEmail: (email, callback) => {
        const sql = "SELECT * FROM teachers WHERE email = ?";
        db.get(sql, [email], callback);
    },

    findById: (id, callback) => {
        const sql = "SELECT * FROM teachers WHERE id = ?";
        db.get(sql, [id], callback);
    },

    getAll: (callback) => {
        db.all("SELECT * FROM teachers", callback);
    },

    updatePasswordByEmail: (email, password, callback) => {
        const sql = "UPDATE teachers SET password = ? WHERE email = ?";
        db.run(sql, [password, email], callback);
    }
};

module.exports = Teacher;