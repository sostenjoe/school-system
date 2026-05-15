const Subject = require("../models/Subject");

exports.addSubject = (req, res) => {
    Subject.create(req.body, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            message: "Subject added successfully"
        });
    });
};

exports.getSubjects = (req, res) => {
    Subject.getAll((err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};