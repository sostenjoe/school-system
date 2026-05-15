const pendingCountEl = document.getElementById("pendingCount");
const trackedSubjectsEl = document.getElementById("trackedSubjects");
const trackedClassesEl = document.getElementById("trackedClasses");
const statusBody = document.getElementById("statusBody");

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to load status information.");
  }
  return data;
}

function renderStatusRows(rows) {
  statusBody.innerHTML = "";
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.class_name}</td>
      <td>${row.subject_name}</td>
      <td>${row.teacher_name}</td>
      <td>${row.submitted_students}</td>
      <td>${row.missing_students}</td>
    `;
    statusBody.appendChild(tr);
  });
}

async function loadSubmissionStatus() {
  const rows = await fetchJson("/api/results/status");
  renderStatusRows(rows);

  const classes = new Set(rows.map((row) => row.class_name));
  const subjects = new Set(rows.map((row) => row.subject_name));
  const pending = rows.reduce((total, row) => total + Number(row.missing_students || 0), 0);

  pendingCountEl.textContent = pending;
  trackedSubjectsEl.textContent = subjects.size;
  trackedClassesEl.textContent = classes.size;
}

loadSubmissionStatus().catch((error) => {
  statusBody.innerHTML = `<tr><td colspan="5" class="error">${error.message}</td></tr>`;
  pendingCountEl.textContent = "—";
  trackedSubjectsEl.textContent = "—";
  trackedClassesEl.textContent = "—";
});
