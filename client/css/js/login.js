const messageEl = document.getElementById("message");
const adminMessageEl = document.getElementById("adminMessage");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotForm = document.getElementById("forgotForm");
const resetForm = document.getElementById("resetForm");
const adminLoginForm = document.getElementById("adminLoginForm");
const showLogin = document.getElementById("showLogin");
const showRegister = document.getElementById("showRegister");
const showForgot = document.getElementById("showForgot");
const teacherRole = document.getElementById("teacherRole");
const adminRole = document.getElementById("adminRole");
const teacherSection = document.getElementById("teacherSection");
const adminSection = document.getElementById("adminSection");
const socialButtons = document.querySelectorAll(".social-login");

const tabButtons = [showLogin, showRegister, showForgot];
const tabMap = {
  loginForm: showLogin,
  registerForm: showRegister,
  forgotForm: showForgot
};

function showForm(formToShow) {
  [loginForm, registerForm, forgotForm, resetForm].forEach((form) => {
    form.classList.toggle("active", form === formToShow);
  });

  tabButtons.forEach((button) => {
    button.classList.toggle("active", button === tabMap[formToShow.id]);
  });

  setMessage(messageEl, "");
}

function setMessage(element, text, type = "") {
  element.textContent = text;
  element.className = type ? `auth-message ${type}` : "auth-message";
}

// Role switching
teacherRole.addEventListener("click", () => {
  teacherRole.classList.add("active");
  adminRole.classList.remove("active");
  teacherSection.classList.add("active");
  adminSection.classList.remove("active");
  setMessage(messageEl, "");
  setMessage(adminMessageEl, "");
});

adminRole.addEventListener("click", () => {
  adminRole.classList.add("active");
  teacherRole.classList.remove("active");
  adminSection.classList.add("active");
  teacherSection.classList.remove("active");
  setMessage(messageEl, "");
  setMessage(adminMessageEl, "");
});

showLogin.addEventListener("click", () => showForm(loginForm));
showRegister.addEventListener("click", () => showForm(registerForm));
showForgot.addEventListener("click", () => showForm(forgotForm));

async function handleSubmit(url, body, successMessage, redirect) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(messageEl, successMessage || data.message, "success");
      if (redirect) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "teacher");
        window.location.href = redirect;
      }
      return data;
    } else {
      setMessage(messageEl, data.message || "Something went wrong.", "error");
      return null;
    }
  } catch (error) {
    setMessage(messageEl, "Server error. Please try again later.", "error");
    return null;
  }
}

async function handleAdminSubmit(url, body, successMessage, redirect) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(adminMessageEl, successMessage || data.message, "success");
      // Set green background for success
      adminMessageEl.style.backgroundColor = "#22c55e";
      adminMessageEl.style.color = "white";
      if (redirect) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "admin");
        setTimeout(() => {
          window.location.href = redirect;
        }, 1000);
      }
    } else {
      setMessage(adminMessageEl, data.message || "Invalid username or password.", "error");
      // Set red background for error
      adminMessageEl.style.backgroundColor = "#ef4444";
      adminMessageEl.style.color = "white";
    }
  } catch (error) {
    setMessage(adminMessageEl, "Server error. Please try again later.", "error");
    // Set red background for error
    adminMessageEl.style.backgroundColor = "#ef4444";
    adminMessageEl.style.color = "white";
  }
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  handleSubmit("/api/auth/login", { email, password }, "Login successful.", "teacher-portal.html");
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  handleSubmit("/api/auth/register", { name, email, password }, "Account created successfully. Please sign in.");
});

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgotEmail").value.trim();
  const data = await handleSubmit("/api/auth/forgot-password", { email });
  if (data) {
    document.getElementById("resetEmail").value = email;
    showForm(resetForm);
    setMessage(messageEl, data.message || "Reset code sent. Check your inbox.", "success");
  }
});

resetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("resetEmail").value.trim();
  const code = document.getElementById("resetCode").value.trim();
  const password = document.getElementById("resetPassword").value;
  handleSubmit("/api/auth/reset-password", { email, code, password }, "Password reset successful. You can sign in now.");
});

adminLoginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value;
  handleAdminSubmit("/api/admin/login", { username, password }, "Admin login successful.", "admin-dashboard.html");
});

socialButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const provider = button.dataset.provider;
    setMessage(messageEl, `${provider} sign in needs OAuth credentials before it can be enabled.`, "warning");
  });
});

showForm(loginForm);
