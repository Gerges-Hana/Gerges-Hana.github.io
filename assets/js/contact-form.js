(function () {
  "use strict";

  const form = document.getElementById("contactForm");

  if (!form) {
    return;
  }

  const loadingEl = form.querySelector(".loading");
  const errorEl = form.querySelector(".error-message");
  const sentEl = form.querySelector(".sent-message");
  const submitBtn = form.querySelector('button[type="submit"]');
  const accessKey = window.WEB3FORMS_ACCESS_KEY || "";

  function setStatus(state) {
    if (loadingEl) {
      loadingEl.style.display = state === "loading" ? "block" : "none";
    }

    if (errorEl) {
      errorEl.style.display = state === "error" ? "block" : "none";
    }

    if (sentEl) {
      sentEl.style.display = state === "sent" ? "block" : "none";
    }

    if (submitBtn) {
      submitBtn.disabled = state === "loading";
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!accessKey || accessKey === "YOUR_ACCESS_KEY_HERE") {
      if (errorEl) {
        errorEl.textContent =
          "Access Key is missing. Copy assets/js/mail.config.example.js to mail.config.js and add your key from https://web3forms.com";
      }
      setStatus("error");
      return;
    }

    setStatus("loading");

    const formData = new FormData(form);
    const payload = {
      access_key: accessKey,
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      subject: "Portfolio contact: " + String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      from_name: "Gerges Hanna Portfolio",
    };

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        return response.json().catch(function () {
          return {
            success: false,
            message: "Unexpected server response.",
          };
        }).then(function (data) {
          if (!response.ok || !data.success) {
            throw new Error(data.message || "Send failed.");
          }

          return data;
        });
      })
      .then(function () {
        setStatus("sent");
        form.reset();
      })
      .catch(function (error) {
        if (errorEl && error.message) {
          errorEl.textContent = error.message;
        }
        setStatus("error");
      });
  });
})();
