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

  subjectSelect.innerHTML = "";
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

// Function to get selected subjects from multi-select
function getSelectedSubjects() {
  const selected = Array.from(subjectSelect.selectedOptions).map(option => Number(option.value));
  return selected;
}

// Function to select subjects for a teacher (for editing)
function selectSubjectsForTeacher(subjectIds) {
  // Clear current selection
  for (let i = 0; i < subjectSelect.options.length; i++) {
    subjectSelect.options[i].selected = false;
  }
  
  // Select the specified subjects
  if (subjectIds && subjectIds.length > 0) {
    for (let i = 0; i < subjectSelect.options.length; i++) {
      if (subjectIds.includes(Number(subjectSelect.options[i].value))) {
        subjectSelect.options[i].selected = true;
      }
    }
  }
}

backBtn.addEventListener("click", () => {
  window.location.href = "admin-dashboard.html";
});

assignmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const teacherId = teacherSelect.value;
  const subjectIds = getSelectedSubjects();

  if (!teacherId) {
    showMessage(assignmentMessageEl, "Please select a teacher.", "error");
    return;
  }

  if (!subjectIds || subjectIds.length === 0) {
    showMessage(assignmentMessageEl, "Please select at least one subject.", "error");
    return;
  }

  try {
    const response = await fetch(`/api/teachers/${teacherId}/subject`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ subjectIds })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(assignmentMessageEl, "Subjects assigned successfully.", "success");
      await loadAssignmentData();
      teacherSelect.value = teacherId;
    } else {
      showMessage(assignmentMessageEl, data.message || "Failed to assign subjects.", "error");
    }
  } catch (error) {
    console.error("Assignment error:", error);
    showMessage(assignmentMessageEl, "Server error. Please try again later.", "error");
  }
});

// When teacher selection changes, show their current subjects
teacherSelect.addEventListener("change", async (e) => {
  const teacherId = e.target.value;
  if (!teacherId) return;
  
  try {
    // Get the selected teacher's current subjects
    const teachers = await fetchJson("/api/teachers", { headers: authHeaders });
    const teacher = teachers.find(t => t.id == teacherId);
    
    if (teacher && teacher.subjects) {
      const subjectIds = teacher.subjects.map(s => s.id);
      selectSubjectsForTeacher(subjectIds);
    }
  } catch (error) {
    console.error("Error loading teacher subjects:", error);
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
