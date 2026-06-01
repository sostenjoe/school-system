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
const credentialsForm = document.getElementById("credentialsForm");
const backBtn = document.getElementById("backBtn");

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  setTimeout(() => {
    messageEl.className = "message";
  }, 5000);
}

backBtn.addEventListener("click", () => {
  window.location.href = "admin-dashboard.html";
});

credentialsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value;
  const newUsername = document.getElementById("newUsername").value.trim();
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!currentPassword) {
    showMessage("🔒 Current password is required.", "error");
    return;
  }

  if (!newUsername && !newPassword) {
    showMessage("⚠️ Please enter at least one new credential.", "error");
    return;
  }

  if (newPassword && confirmPassword !== newPassword) {
    showMessage("❌ New passwords do not match.", "error");
    return;
  }

  if (newPassword && newPassword.length < 6) {
    showMessage("❌ New password must be at least 6 characters.", "error");
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
      showMessage("✅ Credentials updated successfully!", "success");
      credentialsForm.reset();
      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 2000);
    } else {
      showMessage(data.message || "Failed to update credentials.", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("❌ Server error. Please try again later.", "error");
  }
});
