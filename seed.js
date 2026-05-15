const db = require('./server/config/db');

const seedData = () => {
    // Insert subjects
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
    subjects.forEach(subject => {
        db.run('INSERT OR IGNORE INTO subjects (subject_name) VALUES (?)', [subject]);
    });

    // Insert students
    const students = [
        { name: 'Alice Johnson', gender: 'F', class: '10A' },
        { name: 'Bob Smith', gender: 'M', class: '10A' },
        { name: 'Charlie Brown', gender: 'M', class: '10A' },
        { name: 'Diana Prince', gender: 'F', class: '10B' },
        { name: 'Eve Adams', gender: 'F', class: '10B' }
    ];
    students.forEach(student => {
        db.run('INSERT OR IGNORE INTO students (name, gender, class) VALUES (?, ?, ?)', [student.name, student.gender, student.class]);
    });

    console.log('Sample data seeded');
};

seedData();