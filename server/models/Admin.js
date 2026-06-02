const db = require("../config/db");

const Admin = {
    findByUsername: async (username) => {
        const sql = "SELECT * FROM admins WHERE username = ?";
        const rows = await db.query(sql, [username]);
        return rows[0] || null;
    },

    findById: async (id) => {
        const sql = "SELECT * FROM admins WHERE id = ?";
        const rows = await db.query(sql, [id]);
        return rows[0] || null;
    },

    updateCredentials: async (id, username, password) => {
        const sql = "UPDATE admins SET username = ?, password = ? WHERE id = ?";
        await db.query(sql, [username, password, id]);
    },

    getAll: async () => {
        const sql = "SELECT id, username FROM admins";
        return await db.query(sql);
    }
};

module.exports = Admin;