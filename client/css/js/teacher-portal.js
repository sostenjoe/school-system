const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || (role && role !== "teacher")) {
  window.location.href = "login.html";
}
const teacherNameEl = document.getElementById("teacherName");
const teacherEmailEl = document.getElementById("teacherEmail");
const assignedSubjectsCountEl = document.getElementById("assignedSubjectsCount");
const studentCountEl = document.getElementById("studentCount");
const classFilter = document.getElementById("classFilter");
const subjectFilter = document.getElementById("subjectFilter");
const resultTypeFilter = document.getElementById("resultTypeFilter");
const loadStudentsButton = document.getElementById("loadStudents");
const saveResultsButton = document.getElementById("saveResults");
const studentRows = document.getElementById("studentRows");
const submissionStatus = document.getElementById("submissionStatus");
const portalMessage = document.getElementById("portalMessage");
const logoutBtn = document.getElementById("logoutBtn");

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
  if (subjects.length === 0) {
    subjectFilter.innerHTML = "<option value=\"\">No assigned subjects</option>";
    assignedSubjectsCountEl.textContent = "0";
    return;
  }

  subjects.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject.id;
    option.textContent = subject.subject_name;
    subjectFilter.appendChild(option);
  });
  assignedSubjectsCountEl.textContent = subjects.length;
}

async function loadClasses() {
  // UX: filter available classes based on the standards assigned to this teacher.
  // We map: Standard I..VII -> Class labels like "I", "II", ... "VII".
  // (This project stores student.class as a string; we filter it.)

  const [students, teacherStandardsResp] = await Promise.all([
    fetchJson("/api/students"),
    fetchJson("/api/teachers/me/standards", { headers: authHeaders }).catch(() => null)
  ]);

  const teacherStandardGroups = (teacherStandardsResp && teacherStandardsResp.standardGroups) ? teacherStandardsResp.standardGroups : teacherStandardsResp;
  const allowedStandards = Array.isArray(teacherStandardGroups) ? teacherStandardGroups : [];

  const studentClasses = students.map((student) => student.class);

  // If teacher has no standards assigned, fall back to all classes.
  const classListSource = allowedStandards.length
    ? studentClasses.filter((c) => allowedStandards.includes(String(c).toUpperCase().trim()))
    : studentClasses;

  const classList = [...new Set(classListSource)].sort();
  classFilter.innerHTML = "";

  if (classList.length === 0) {
    classFilter.innerHTML = "<option value=\"\">No classes available</option>";
    studentCountEl.textContent = 0;
    return;
  }

  classList.forEach((className) => {
    const option = document.createElement("option");
    option.value = className;
    option.textContent = className;
    classFilter.appendChild(option);
  });

  studentCountEl.textContent = classListSource.length;
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
  const selectedType = resultTypeFilter.value;

  if (!selectedClass || !selectedSubject || !selectedType) {
    setMessage("Please choose class, subject, and result type.", "error");
    return;
  }

  submissionStatus.textContent = `Loading ${selectedClass} results...`;

  try {
    const students = await fetchJson(
      `/api/results/class/${encodeURIComponent(selectedClass)}/subject/${selectedSubject}?result_type=${encodeURIComponent(selectedType)}`,
      { headers: authHeaders }
    );
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
  const selectedType = resultTypeFilter.value;

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
      body: JSON.stringify({ results, result_type: selectedType })
    });
    setMessage(`Saved ${results.length} ${selectedType.replace("_", " ")} result entries successfully.`);
    await loadStudentRows();
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

document.getElementById("registerStudentBtn")?.addEventListener("click", () => {
  window.location.href = "student-register.html";
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
});
