const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
  window.location.href = "login.html";
}

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
};

let subjectChart = null;
let classChart = null;

function formatResultType(type) {
  return String(type || "terminal")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to load data.");
  }
  return data;
}

async function loadAdminProfile() {
  try {
    const admin = await fetchJson("/api/admin/me", { headers: authHeaders });
    document.getElementById("adminUsername").textContent = admin.username;
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

async function loadMetrics() {
  try {
    const students = await fetchJson("/api/students");
    const teachers = await fetchJson("/api/teachers", { headers: authHeaders });
    const subjects = await fetchJson("/api/subjects");
    const results = await fetchJson("/api/results");
    
    document.getElementById("totalStudents").textContent = students.length;
    document.getElementById("totalTeachers").textContent = teachers.length;
    document.getElementById("totalSubjects").textContent = subjects.length;
    
    if (results.length > 0) {
      const avgMarks = results.reduce((sum, r) => sum + (r.marks || 0), 0) / results.length;
      document.getElementById("averageScore").textContent = avgMarks.toFixed(2);
    }
  } catch (error) {
    console.error("Error loading metrics:", error);
  }
}

async function loadSubjectPerformance() {
  try {
    const data = await fetchJson("/api/analytics/subject-performance", { headers: authHeaders });
    
    const labels = data.map(s => s.subject_name);
    const avgMarks = data.map(s => s.average_marks || 0);
    const passingCounts = data.map(s => s.passing_count || 0);
    
    const ctx = document.getElementById("subjectChart").getContext("2d");
    if (subjectChart) {
      subjectChart.destroy();
    }
    
    subjectChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Average Marks",
            data: avgMarks,
            backgroundColor: "rgba(75, 192, 192, 0.7)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1
          },
          {
            label: "Passing Students",
            data: passingCounts,
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top"
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Error loading subject performance:", error);
  }
}

async function loadClassPerformance() {
  try {
    const data = await fetchJson("/api/analytics/class-performance", { headers: authHeaders });
    
    const labels = data.map(c => c.class);
    const avgMarks = data.map(c => c.average_marks || 0);
    const totalStudents = data.map(c => c.total_students || 0);
    
    const ctx = document.getElementById("classChart").getContext("2d");
    if (classChart) {
      classChart.destroy();
    }
    
    classChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Average Marks",
            data: avgMarks,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderWidth: 2,
            fill: true
          },
          {
            label: "Total Students",
            data: totalStudents,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top"
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Error loading class performance:", error);
  }
}

async function loadTopPerformers() {
  try {
    const data = await fetchJson("/api/analytics/top-performers?limit=10", { headers: authHeaders });
    const tbody = document.getElementById("topPerformersBody");
    
    if (data.length === 0) {
      tbody.innerHTML = "<tr><td colspan=\"7\" style=\"text-align: center;\">No data available</td></tr>";
      return;
    }
    
    tbody.innerHTML = data.map(student => `
      <tr>
        <td>${student.name}</td>
        <td>${student.class}</td>
        <td>${student.subject_name}</td>
        <td>${formatResultType(student.result_type)}</td>
        <td>${student.marks}</td>
        <td>${student.grade}</td>
        <td>${student.teacher_name || "N/A"}</td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Error loading top performers:", error);
    document.getElementById("topPerformersBody").innerHTML = "<tr><td colspan=\"7\" style=\"text-align: center; color: red;\">Error loading data</td></tr>";
  }
}

async function loadUnderperforming() {
  try {
    const data = await fetchJson("/api/analytics/underperforming?threshold=50", { headers: authHeaders });
    const tbody = document.getElementById("underperformingBody");
    
    if (data.length === 0) {
      tbody.innerHTML = "<tr><td colspan=\"7\" style=\"text-align: center;\">Great! No underperforming results below 50</td></tr>";
      return;
    }
    
    tbody.innerHTML = data.map(student => `
      <tr>
        <td>${student.name}</td>
        <td>${student.class}</td>
        <td>${student.subject_name}</td>
        <td>${formatResultType(student.result_type)}</td>
        <td>${student.marks}</td>
        <td>${student.grade}</td>
        <td>${student.teacher_name || "N/A"}</td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Error loading underperforming students:", error);
    document.getElementById("underperformingBody").innerHTML = "<tr><td colspan=\"7\" style=\"text-align: center; color: red;\">Error loading data</td></tr>";
  }
}

async function loadClassSummary() {
  try {
    const data = await fetchJson("/api/results/class-summary", { headers: authHeaders });
    const tbody = document.getElementById("classSummaryBody");

    if (data.length === 0) {
      tbody.innerHTML = "<tr><td colspan=\"8\" style=\"text-align: center;\">No class results available</td></tr>";
      return;
    }

    tbody.innerHTML = data.map((row) => `
      <tr>
        <td>${row.class_name}</td>
        <td>${formatResultType(row.result_type)}</td>
        <td>${row.total_students || 0}</td>
        <td>${row.submitted_results || 0}</td>
        <td>${row.average_marks !== null && row.average_marks !== undefined ? row.average_marks : "N/A"}</td>
        <td>${row.highest_marks !== null && row.highest_marks !== undefined ? row.highest_marks : "N/A"}</td>
        <td>${row.lowest_marks !== null && row.lowest_marks !== undefined ? row.lowest_marks : "N/A"}</td>
        <td>${row.underperforming_results || 0}</td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Error loading class summary:", error);
    document.getElementById("classSummaryBody").innerHTML = "<tr><td colspan=\"8\" style=\"text-align: center; color: red;\">Error loading class summary</td></tr>";
  }
}

async function loadTeacherPerformance() {
  try {
    const data = await fetchJson("/api/analytics/teacher-performance", { headers: authHeaders });
    const tbody = document.getElementById("teacherPerformanceBody");
    
    if (data.length === 0) {
      tbody.innerHTML = "<tr><td colspan=\"6\" style=\"text-align: center;\">No teacher data available</td></tr>";
      return;
    }
    
    tbody.innerHTML = data.map(teacher => `
      <tr>
        <td>${teacher.teacher_name}</td>
        <td>${teacher.subject_name || "Not assigned"}</td>
        <td>${teacher.students_taught || 0}</td>
        <td>${teacher.average_marks ? teacher.average_marks.toFixed(2) : "N/A"}</td>
        <td>${teacher.passing_students || 0}</td>
        <td>${teacher.underperforming_students || 0}</td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Error loading teacher performance:", error);
    document.getElementById("teacherPerformanceBody").innerHTML = "<tr><td colspan=\"6\" style=\"text-align: center; color: red;\">Error loading data</td></tr>";
  }
}

document.getElementById("settingsBtn").addEventListener("click", () => {
  window.location.href = "admin-settings.html";
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
});

// Load all data on page load
loadAdminProfile();
loadMetrics();
loadSubjectPerformance();
loadClassPerformance();
loadClassSummary();
loadTopPerformers();
loadUnderperforming();
loadTeacherPerformance();

// Refresh data every 30 seconds
setInterval(() => {
  loadMetrics();
  loadSubjectPerformance();
  loadClassPerformance();
  loadClassSummary();
  loadTopPerformers();
  loadUnderperforming();
  loadTeacherPerformance();
}, 30000);
