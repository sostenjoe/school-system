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
    res.json({ id: teacher.id, name: teacher.name, email: teacher.email, subject_id: teacher.subject_id });
  });
};

exports.getTeachers = (req, res) => {
  Teacher.getAll((err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.json(result);
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

    res.json(result || []);
  });
};

exports.assignSubjectToTeacher = (req, res) => {
  const teacherId = Number(req.params.teacherId);
  const subjectId = Number(req.body.subjectId);

  if (!teacherId || !subjectId) {
    return res.status(400).json({ message: "Teacher ID and Subject ID are required." });
  }

  db.get("SELECT id FROM teachers WHERE id = ?", [teacherId], (teacherErr, teacher) => {
    if (teacherErr) {
      return res.status(500).json({ message: teacherErr.message });
    }

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    db.get("SELECT id FROM subjects WHERE id = ?", [subjectId], (subjectErr, subject) => {
      if (subjectErr) {
        return res.status(500).json({ message: subjectErr.message });
      }

      if (!subject) {
        return res.status(404).json({ message: "Subject not found." });
      }

      db.serialize(() => {
        db.run("DELETE FROM teacher_subjects WHERE teacher_id = ?", [teacherId], (deleteErr) => {
          if (deleteErr) {
            return res.status(500).json({ message: deleteErr.message });
          }

          db.run(
            "INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)",
            [teacherId, subjectId],
            (insertErr) => {
              if (insertErr) {
                return res.status(500).json({ message: insertErr.message });
              }

              Teacher.assignSubject(teacherId, subjectId, (assignErr) => {
                if (assignErr) {
                  return res.status(500).json({ message: assignErr.message });
                }

                res.json({ message: "Subject assigned to teacher successfully." });
              });
            }
          );
        });
      });
    });
  });
};

exports.assignSubject = (req, res) => {
  const teacherId = req.teacher?.id;
  const { subjectId } = req.body;

  if (!teacherId || !subjectId) {
    return res.status(400).json({ message: "Teacher ID and Subject ID required." });
  }

  Teacher.assignSubject(teacherId, subjectId, (err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    db.run("DELETE FROM teacher_subjects WHERE teacher_id = ?", [teacherId], (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ message: deleteErr.message });
      }

      db.run(
        "INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)",
        [teacherId, subjectId],
        (insertErr) => {
          if (insertErr) {
            return res.status(500).json({ message: insertErr.message });
          }

          res.json({ message: "Subject assigned successfully" });
        }
      );
    });
  });
};
