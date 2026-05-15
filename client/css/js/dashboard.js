async function loadDashboard(){

const students =
await fetch(
"/api/students"
);

const studentData =
await students.json();

document.getElementById(
"studentCount"
).innerText =
studentData.length;

const subjects =
await fetch(
"/api/subjects"
);

const subjectData =
await subjects.json();

document.getElementById(
"subjectCount"
).innerText =
subjectData.length;

const results =
await fetch(
"/api/results"
);

const resultData =
await results.json();

document.getElementById(
"resultCount"
).innerText =
resultData.length;

}

loadDashboard();