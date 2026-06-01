const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "teacher") {
  window.location.href = "login.html";
}

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
};

const messageEl = document.getElementById("message");
const studentForm = document.getElementById("studentForm");
const backBtn = document.getElementById("backBtn");
const studentsList = document.getElementById("studentsList");

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  if (type === "success") {
    setTimeout(() => {
      messageEl.className = "message";
    }, 3000);
  }
}

async function loadStudentsByTeacher() {
  try {
    const response = await fetch("/api/students/by-teacher", { headers: authHeaders });
    const data = await response.json();

    if (response.ok && data.length > 0) {
      studentsList.innerHTML = data.map(student => `
        <div class="student-item">
          <div class="student-info">
            <div class="student-name">👤 ${student.name}</div>
            <div class="student-class">📚 Class: ${student.class}</div>
          </div>
        </div>
      `).join("");
    } else {
      studentsList.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 20px;">No students registered yet. Register your first student above! ➕</p>';
    }
  } catch (error) {
    console.error("Error loading students:", error);
    studentsList.innerHTML = '<p style="text-align: center; color: var(--danger); padding: 20px;">Error loading students</p>';
  }
}

backBtn.addEventListener("click", () => {
  window.location.href = "teacher-portal.html";
});

studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("studentName").value.trim();
  const gender = document.getElementById("studentGender").value || "Not specified";
  const studentClass = document.getElementById("studentClass").value.trim();

  if (!name || !studentClass) {
    showMessage("⚠️ Please fill in all required fields.", "error");
    return;
  }

  try {
    const response = await fetch("/api/students/register", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name,
        gender,
        class: studentClass
      })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(`✅ ${name} registered successfully!`, "success");
      studentForm.reset();
      loadStudentsByTeacher(); // Refresh the list
    } else {
      showMessage(data.message || "Failed to register student.", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("❌ Server error. Please try again later.", "error");
  }
});

// Load students on page load
loadStudentsByTeacher();
