const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
  window.location.href = "login.html";
}

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
};

const messageEl = document.getElementById("message");
const assignmentMessageEl = document.getElementById("assignmentMessage");
const credentialsForm = document.getElementById("credentialsForm");
const assignmentForm = document.getElementById("assignmentForm");
const teacherSelect = document.getElementById("teacherSelect");
const subjectSelect = document.getElementById("subjectSelect");
const backBtn = document.getElementById("backBtn");

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `message ${type}`;
  setTimeout(() => {
    element.className = "message";
  }, 5000);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load data.");
  }

  return data;
}

function renderTeacherOptions(teachers) {
  if (!teachers.length) {
    teacherSelect.innerHTML = "<option value=\"\">No registered teachers found</option>";
    return;
  }

  teacherSelect.innerHTML = "<option value=\"\">Select teacher</option>";
  teachers.forEach((teacher) => {
    const option = document.createElement("option");
    option.value = teacher.id;
    option.textContent = `${teacher.name} (${teacher.email})${teacher.subject_name ? ` - ${teacher.subject_name}` : ""}`;
    teacherSelect.appendChild(option);
  });
}

function renderSubjectOptions(subjects) {
  if (!subjects.length) {
    subjectSelect.innerHTML = "<option value=\"\">No subjects found</option>";
    return;
  }

  subjectSelect.innerHTML = "<option value=\"\">Select subject</option>";
  subjects.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject.id;
    option.textContent = subject.subject_name;
    subjectSelect.appendChild(option);
  });
}

async function loadAssignmentData() {
  try {
    const [teachers, subjects] = await Promise.all([
      fetchJson("/api/teachers", { headers: authHeaders }),
      fetchJson("/api/subjects")
    ]);

    renderTeacherOptions(teachers);
    renderSubjectOptions(subjects);
  } catch (error) {
    console.error("Assignment data error:", error);
    teacherSelect.innerHTML = "<option value=\"\">Unable to load teachers</option>";
    subjectSelect.innerHTML = "<option value=\"\">Unable to load subjects</option>";
    showMessage(assignmentMessageEl, error.message || "Unable to load assignment data.", "error");
  }
}

backBtn.addEventListener("click", () => {
  window.location.href = "admin-dashboard.html";
});

assignmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const teacherId = teacherSelect.value;
  const subjectId = subjectSelect.value;

  if (!teacherId || !subjectId) {
    showMessage(assignmentMessageEl, "Please choose both a teacher and a subject.", "error");
    return;
  }

  try {
    const response = await fetch(`/api/teachers/${teacherId}/subject`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ subjectId })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(assignmentMessageEl, "Subject assigned successfully.", "success");
      await loadAssignmentData();
      teacherSelect.value = teacherId;
      subjectSelect.value = subjectId;
    } else {
      showMessage(assignmentMessageEl, data.message || "Failed to assign subject.", "error");
    }
  } catch (error) {
    console.error("Assignment error:", error);
    showMessage(assignmentMessageEl, "Server error. Please try again later.", "error");
  }
});

credentialsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value;
  const newUsername = document.getElementById("newUsername").value.trim();
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!currentPassword) {
    showMessage(messageEl, "Current password is required.", "error");
    return;
  }

  if (!newUsername && !newPassword) {
    showMessage(messageEl, "Please enter at least one new credential.", "error");
    return;
  }

  if (newPassword && confirmPassword !== newPassword) {
    showMessage(messageEl, "New passwords do not match.", "error");
    return;
  }

  if (newPassword && newPassword.length < 6) {
    showMessage(messageEl, "New password must be at least 6 characters.", "error");
    return;
  }

  try {
    const response = await fetch("/api/admin/credentials", {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        oldPassword: currentPassword,
        newUsername: newUsername || undefined,
        newPassword: newPassword || undefined
      })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(messageEl, "Credentials updated successfully.", "success");
      credentialsForm.reset();
      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 2000);
    } else {
      showMessage(messageEl, data.message || "Failed to update credentials.", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage(messageEl, "Server error. Please try again later.", "error");
  }
});

loadAssignmentData();
