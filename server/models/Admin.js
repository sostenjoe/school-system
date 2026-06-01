const db = require("../config/db");

const Admin = {
    findByUsername: (username, callback) => {
        const sql = "SELECT * FROM admins WHERE username = ?";
        db.get(sql, [username], callback);
    },

    findById: (id, callback) => {
        const sql = "SELECT * FROM admins WHERE id = ?";
        db.get(sql, [id], callback);
    },

    updateCredentials: (id, username, password, callback) => {
        const sql = "UPDATE admins SET username = ?, password = ? WHERE id = ?";
        db.run(sql, [username, password, id], callback);
    },

    getAll: (callback) => {
        db.all("SELECT id, username FROM admins", callback);
    }
};

module.exports = Admin;
