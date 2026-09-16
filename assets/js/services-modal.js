(function () {
  "use strict";

  const SERVICE_KEYS = ["hosting", "wordpress", "laravel", "devops"];

  const SERVICE_ICONS = {
    hosting: "bi-hdd-stack",
    wordpress: "bi-wordpress",
    laravel: "bi-diagram-3",
    devops: "bi-cloud-check",
  };

  let modal;
  let overlay;
  let closeBtn;
  let titleEl;
  let descEl;
  let iconEl;
  let statA;
  let statB;
  let contactBtn;
  let statInterval;
  let currentServiceKey = null;

  function getTranslation(key) {
    const lang = document.documentElement.lang === "ar" ? "ar" : "en";
    const dictionary = window.GergesI18nTranslations || {};
    const parts = key.split(".");
    let value = dictionary[lang];

    parts.forEach(function (part) {
      value = value && value[part] !== undefined ? value[part] : null;
    });

    return value;
  }

  function updateStatLabels(serviceKey) {
    if (!statA || !statB) {
      return;
    }

    statA.textContent = getTranslation("services.stats." + serviceKey + ".a") || "99.9%";
    statB.textContent = getTranslation("services.stats." + serviceKey + ".b") || "24/7";
  }

  function populateModal(serviceKey) {
    if (!SERVICE_KEYS.includes(serviceKey)) {
      return;
    }

    const title = getTranslation("services." + serviceKey) || serviceKey;
    const desc = getTranslation("services." + serviceKey + "Desc") || "";
    const contact = getTranslation("services.contactBtn") || "Contact Me";

    titleEl.textContent = title;
    descEl.textContent = desc;
    contactBtn.textContent = contact;
    iconEl.className = "bi " + (SERVICE_ICONS[serviceKey] || "bi-stars");
    updateStatLabels(serviceKey);
  }

  function startStatAnimation(serviceKey) {
    clearInterval(statInterval);
    updateStatLabels(serviceKey);

    statInterval = setInterval(function () {
      if (!modal.classList.contains("open")) {
        return;
      }
      updateStatLabels(serviceKey);
    }, 2800);
  }

  function openModal(serviceKey) {
    if (!SERVICE_KEYS.includes(serviceKey)) {
      return;
    }

    currentServiceKey = serviceKey;
    populateModal(serviceKey);

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    startStatAnimation(serviceKey);
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    clearInterval(statInterval);
    currentServiceKey = null;
  }

  function refreshModal() {
    if (!currentServiceKey || !modal.classList.contains("open")) {
      return;
    }

    populateModal(currentServiceKey);
  }

  function initServicesModal() {
    modal = document.getElementById("service-modal");
    if (!modal) {
      return;
    }

    overlay = modal.querySelector(".service-modal-overlay");
    closeBtn = modal.querySelector(".service-modal-close");
    titleEl = modal.querySelector("#service-modal-title");
    descEl = modal.querySelector("#service-modal-desc");
    iconEl = modal.querySelector("#service-modal-icon i");
    statA = modal.querySelector(".service-float-stat.stat-a");
    statB = modal.querySelector(".service-float-stat.stat-b");
    contactBtn = modal.querySelector(".service-modal-contact");

    document.querySelectorAll(".service-card-trigger").forEach(function (card) {
      card.addEventListener("click", function () {
        openModal(card.getAttribute("data-service"));
      });
    });

    overlay.addEventListener("click", closeModal);
    closeBtn.addEventListener("click", closeModal);

    contactBtn.addEventListener("click", function () {
      closeModal();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
      }
    });
  }

  window.GergesServicesModal = {
    refresh: refreshModal,
  };

  document.addEventListener("DOMContentLoaded", initServicesModal);
})();
