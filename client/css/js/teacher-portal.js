const token = localStorage.getItem("token");
const teacherNameEl = document.getElementById("teacherName");
const teacherEmailEl = document.getElementById("teacherEmail");
const assignedSubjectsCountEl = document.getElementById("assignedSubjectsCount");
const studentCountEl = document.getElementById("studentCount");
const classFilter = document.getElementById("classFilter");
const subjectFilter = document.getElementById("subjectFilter");
const loadStudentsButton = document.getElementById("loadStudents");
const saveResultsButton = document.getElementById("saveResults");
const studentRows = document.getElementById("studentRows");
const submissionStatus = document.getElementById("submissionStatus");
const portalMessage = document.getElementById("portalMessage");

if (!token) {
  window.location.href = "login.html";
}

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to load data.");
  }
  return data;
}

function setMessage(message, type = "info") {
  portalMessage.textContent = message;
  portalMessage.className = type === "error" ? "note-text error" : "note-text";
}

function clearMessage() {
  portalMessage.textContent = "";
  portalMessage.className = "note-text";
}

async function loadTeacherProfile() {
  const teacher = await fetchJson("/api/teachers/me", { headers: authHeaders });
  teacherNameEl.textContent = teacher.name;
  teacherEmailEl.textContent = teacher.email;
}

async function loadSubjects() {
  const subjects = await fetchJson("/api/teachers/subjects", { headers: authHeaders });
  subjectFilter.innerHTML = "";
  subjects.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject.id;
    option.textContent = subject.subject_name;
    subjectFilter.appendChild(option);
  });
  assignedSubjectsCountEl.textContent = subjects.length;
}

async function loadClasses() {
  const students = await fetchJson("/api/students");
  const classList = [...new Set(students.map((student) => student.class))].sort();
  classFilter.innerHTML = "";

  if (classList.length === 0) {
    classFilter.innerHTML = "<option value=\"\">No classes available</option>";
    return;
  }

  classList.forEach((className) => {
    const option = document.createElement("option");
    option.value = className;
    option.textContent = className;
    classFilter.appendChild(option);
  });

  studentCountEl.textContent = students.length;
}

function renderStudentTable(students) {
  studentRows.innerHTML = "";
  students.forEach((student, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.student_name}</td>
      <td><input type="number" min="0" max="100" value="${student.marks !== null && student.marks !== undefined ? student.marks : ""}" data-student-id="${student.student_id}" class="result-input"></td>
      <td>${student.marks !== null && student.marks !== undefined ? "Saved" : "Not submitted"}</td>
    `;
    studentRows.appendChild(row);
  });
}

async function loadStudentRows() {
  clearMessage();
  const selectedClass = classFilter.value;
  const selectedSubject = subjectFilter.value;

  if (!selectedClass || !selectedSubject) {
    setMessage("Please choose both class and subject.", "error");
    return;
  }

  submissionStatus.textContent = `Loading ${selectedClass} / subject...`;

  try {
    const students = await fetchJson(`/api/results/class/${encodeURIComponent(selectedClass)}/subject/${selectedSubject}`, { headers: authHeaders });
    renderStudentTable(students.map((student) => ({
      student_id: student.student_id,
      student_name: student.student_name,
      marks: student.marks,
      grade: student.grade
    })));
    submissionStatus.textContent = `${students.length} students loaded for ${selectedClass}`;
  } catch (error) {
    setMessage(error.message, "error");
    submissionStatus.textContent = "Unable to load students.";
  }
}

async function saveResultBatch() {
  clearMessage();
  const selectedSubject = subjectFilter.value;
  const selectedClass = classFilter.value;

  const rows = Array.from(document.querySelectorAll(".result-input"));
  const results = rows
    .map((input) => ({
      student_id: Number(input.dataset.studentId),
      subject_id: Number(selectedSubject),
      marks: input.value.trim() === "" ? null : Number(input.value.trim())
    }))
    .filter((entry) => entry.marks !== null && !Number.isNaN(entry.marks));

  if (results.length === 0) {
    setMessage("Enter marks for at least one student before saving.", "error");
    return;
  }

  try {
    await fetchJson("/api/results/batch", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ results })
    });
    setMessage(`Saved ${results.length} result entries successfully. Redirecting to admin view...`);
    setTimeout(() => {
      window.location.href = "admin-submissions.html";
    }, 1200);
  } catch (error) {
    setMessage(error.message, "error");
  }
}

loadTeacherProfile().catch((error) => {
  console.error(error);
  window.location.href = "login.html";
});
loadSubjects().catch((error) => setMessage(error.message, "error"));
loadClasses().catch((error) => setMessage(error.message, "error"));
loadStudentsButton.addEventListener("click", loadStudentRows);
saveResultsButton.addEventListener("click", saveResultBatch);
