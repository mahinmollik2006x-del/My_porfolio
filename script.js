const form = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const rememberInput = document.querySelector("#remember-me");
const passwordToggle = document.querySelector("#password-toggle");
const statusMessage = document.querySelector("#form-status");
const welcomePanel = document.querySelector("#welcome-panel");
const cursorRays = document.querySelector("#cursor-rays");
const lampBulbs = [
  document.querySelector("#lamp-bulb-left"),
  document.querySelector("#lamp-bulb-right")
];
const savedEmailKey = "northstar-login-email";
let demoSignInCompleted = false;
let lastPointerPosition = null;

function updateCursorLight(x, y) {
  lastPointerPosition = { x, y };
  cursorRays.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);

  for (const [index, bulb] of lampBulbs.entries()) {
    const bounds = bulb.getBoundingClientRect();
    const rayIds = [
      `#cursor-ray-${index === 0 ? "left" : "right"}-glow`,
      `#cursor-ray-${index === 0 ? "left" : "right"}`
    ];

    for (const id of rayIds) {
      const ray = document.querySelector(id);
      ray.setAttribute("x1", String(bounds.left + bounds.width / 2));
      ray.setAttribute("y1", String(bounds.top + bounds.height / 2));
      ray.setAttribute("x2", String(x));
      ray.setAttribute("y2", String(y));
    }
  }

  document.querySelector("#cursor-spark").setAttribute("cx", String(x));
  document.querySelector("#cursor-spark").setAttribute("cy", String(y));
  document.querySelector("#cursor-spark-glow").setAttribute("cx", String(x));
  document.querySelector("#cursor-spark-glow").setAttribute("cy", String(y));
  cursorRays.classList.add("is-active");
  welcomePanel.classList.add("lamp-lit");
}

function showStatus(message, state) {
  statusMessage.textContent = message;
  if (state) {
    statusMessage.dataset.state = state;
  } else {
    delete statusMessage.dataset.state;
  }
}

function validateField(input) {
  const isValid = input.checkValidity();
  input.setAttribute("aria-invalid", String(!isValid));
  return isValid;
}

try {
  const savedEmail = localStorage.getItem(savedEmailKey);
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberInput.checked = true;
  }
} catch (error) {
  console.error("Could not read the remembered email from this browser.", error);
  showStatus("This browser could not access saved email settings.", "error");
}

passwordToggle.addEventListener("click", () => {
  const isPasswordHidden = passwordInput.type === "password";
  passwordInput.type = isPasswordHidden ? "text" : "password";
  passwordToggle.textContent = isPasswordHidden ? "Hide" : "Show";
  passwordToggle.setAttribute("aria-label", isPasswordHidden ? "Hide password" : "Show password");
  passwordToggle.setAttribute("aria-pressed", String(isPasswordHidden));
});

for (const input of [emailInput, passwordInput]) {
  input.addEventListener("input", () => {
    if (input.validity.valid) {
      input.setAttribute("aria-invalid", "false");
      showStatus("");
    }
  });
}

rememberInput.addEventListener("change", () => {
  if (!rememberInput.checked) {
    try {
      localStorage.removeItem(savedEmailKey);
    } catch (error) {
      console.error("Could not remove the remembered email from this browser.", error);
      showStatus("This browser could not clear the saved email.", "error");
    }
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fieldsAreValid = [emailInput, passwordInput].map(validateField).every(Boolean);
  if (!fieldsAreValid) {
    const firstInvalidField = [emailInput, passwordInput].find((input) => !input.validity.valid);
    firstInvalidField.focus();
    showStatus("Check your email and password, then try again.", "error");
    return;
  }

  try {
    if (rememberInput.checked) {
      localStorage.setItem(savedEmailKey, emailInput.value.trim());
    } else {
      localStorage.removeItem(savedEmailKey);
    }
  } catch (error) {
    console.error("Could not update the remembered email in this browser.", error);
    showStatus("Your email could not be saved. This front-end demo cannot sign you in.", "error");
    return;
  }

  welcomePanel.classList.add("lamp-lit");
  demoSignInCompleted = true;
  showStatus("This is a demo only; connect an authentication service to sign in.", "success");
});

window.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "touch") {
    updateCursorLight(event.clientX, event.clientY);
  }
}, { passive: true });

window.addEventListener("resize", () => {
  if (lastPointerPosition) {
    updateCursorLight(lastPointerPosition.x, lastPointerPosition.y);
  }
});

document.documentElement.addEventListener("pointerleave", () => {
  cursorRays.classList.remove("is-active");
  if (!demoSignInCompleted) {
    welcomePanel.classList.remove("lamp-lit");
  }
});

document.querySelector("#forgot-password").addEventListener("click", (event) => {
  event.preventDefault();
  if (!validateField(emailInput)) {
    emailInput.focus();
    showStatus("Enter a valid email address before requesting a password reset.", "error");
    return;
  }

  showStatus("Password reset is not available in this front-end demo.");
});

document.querySelector("#create-account").addEventListener("click", (event) => {
  event.preventDefault();
  showStatus("Account creation is not available in this front-end demo.");
});

document.querySelector("#privacy-link").addEventListener("click", (event) => {
  event.preventDefault();
  showStatus("This demo does not send your information to a server.");
});
