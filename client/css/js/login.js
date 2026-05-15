const messageEl = document.getElementById("message");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotForm = document.getElementById("forgotForm");
const resetForm = document.getElementById("resetForm");
const showLogin = document.getElementById("showLogin");
const showRegister = document.getElementById("showRegister");
const showForgot = document.getElementById("showForgot");

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

  messageEl.textContent = "";
}

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
      messageEl.textContent = successMessage || data.message;
      if (data.resetCode) {
        messageEl.textContent += ` Your reset code: ${data.resetCode}`;
      }
      if (redirect) {
        localStorage.setItem("token", data.token);
        window.location.href = redirect;
      }
    } else {
      messageEl.textContent = data.message || "Something went wrong.";
    }
  } catch (error) {
    messageEl.textContent = "Server error. Please try again later.";
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

forgotForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("forgotEmail").value.trim();
  handleSubmit("/api/auth/forgot-password", { email }, "Reset code requested.");
  showForm(resetForm);
});

resetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("resetEmail").value.trim();
  const code = document.getElementById("resetCode").value.trim();
  const password = document.getElementById("resetPassword").value;
  handleSubmit("/api/auth/reset-password", { email, code, password }, "Password reset successful. You can sign in now.");
});

showForm(loginForm);