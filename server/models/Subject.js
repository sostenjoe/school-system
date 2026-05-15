const db = require("../config/db");

const Subject = {
    create: (data, callback) => {
        const query = "INSERT INTO subjects(subject_name) VALUES (?)";
        db.run(query, [data.subject_name], function(err) {
            callback(err, { insertId: this.lastID });
        });
    },

    getAll: (callback) => {
        db.all("SELECT * FROM subjects", callback);
    }
};

module.exports = Subject;