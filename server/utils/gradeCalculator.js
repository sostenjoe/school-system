function calculateGrade(marks) {
    if (marks >= 80) return "A";
    if (marks >= 60) return "B";
    if (marks >= 40) return "C";
    if (marks >= 20) return "D";

    return "F";
}

module.exports = calculateGrade;