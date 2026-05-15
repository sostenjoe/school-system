const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const db = require("../config/db");

exports.getMe = (req, res) => {
  const teacherId = req.teacher?.id;

  if (!teacherId) {
    return res.status(401).json({ message: "Unauthorized access." });
  }

  Teacher.findById(teacherId, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (!result) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    const teacher = result;
    res.json({ id: teacher.id, name: teacher.name, email: teacher.email });
  });
};

exports.getSubjects = (req, res) => {
  const teacherId = req.teacher?.id;

  if (!teacherId) {
    return res.status(401).json({ message: "Unauthorized access." });
  }

  const sql = `
    SELECT subjects.*
    FROM subjects
    JOIN teacher_subjects ON teacher_subjects.subject_id = subjects.id
    WHERE teacher_subjects.teacher_id = ?
  `;

  db.all(sql, [teacherId], (err, result) => {
    if (err) {
      // For SQLite, if table doesn't exist, fallback to all subjects
      return Subject.getAll((subjectErr, subjects) => {
        if (subjectErr) {
          return res.status(500).json(subjectErr);
        }
        return res.json(subjects);
      });
    }

    if (!result || result.length === 0) {
      return Subject.getAll((subjectErr, subjects) => {
        if (subjectErr) {
          return res.status(500).json(subjectErr);
        }
        return res.json(subjects);
      });
    }

    res.json(result);
  });
};
