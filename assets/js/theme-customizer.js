(function () {
  "use strict";

  const STORAGE_KEY = "gerges-profile-settings";
  const DEFAULTS = {
    theme: "light",
    accent: "#7c3aed",
    preview: "desktop",
  };

  const PREVIEW_LABELS = {
    mobile: "Mobile 390px",
    tablet: "Tablet 768px",
    desktop: "Desktop",
  };

  const COLOR_PRESETS = [
    { name: "Purple", value: "#7c3aed" },
    { name: "Blue", value: "#2563eb" },
    { name: "Teal", value: "#0d9488" },
    { name: "Green", value: "#16a34a" },
    { name: "Orange", value: "#ea580c" },
    { name: "Pink", value: "#db2777" },
  ];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function hexToRgb(hex) {
    const normalized = hex.replace("#", "");
    const value =
      normalized.length === 3
        ? normalized
            .split("")
            .map((char) => char + char)
            .join("")
        : normalized;

    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map((channel) => clamp(channel, 0, 255).toString(16).padStart(2, "0"))
        .join("")
    );
  }

  function shiftHex(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r + amount, g + amount, b + amount);
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { ...DEFAULTS, ...saved };
    } catch (error) {
      return { ...DEFAULTS };
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function applyAccent(color) {
    const root = document.documentElement;
    root.style.setProperty("--accent-color", color);
    root.style.setProperty("--purple", color);
    root.style.setProperty("--purple-dark", shiftHex(color, -35));
    root.style.setProperty("--purple-light", shiftHex(color, 45));
    root.style.setProperty("--nav-dropdown-hover-color", color);
    root.style.setProperty(
      "--card-shadow-hover",
      `0 15px 35px color-mix(in srgb, ${color}, transparent 78%)`
    );
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function applyPreview(preview) {
    const root = document.documentElement;

    if (preview === "desktop") {
      root.removeAttribute("data-preview");
      root.removeAttribute("data-preview-label");
      return;
    }

    root.setAttribute("data-preview", preview);
    root.setAttribute("data-preview-label", PREVIEW_LABELS[preview] || preview);
  }

  function applySettings(settings) {
    applyTheme(settings.theme);
    applyAccent(settings.accent);
    applyPreview(settings.preview);
  }

  function setActiveButtons(selector, activeValue, attributeName) {
    document.querySelectorAll(selector).forEach((button) => {
      const value = button.getAttribute(attributeName);
      button.classList.toggle("active", value === activeValue);
    });
  }

  function initCustomizer() {
    const settings = loadSettings();
    applySettings(settings);

    const panel = document.getElementById("theme-customizer");
    const overlay = document.getElementById("customizer-overlay");
    const toggle = document.getElementById("customizer-toggle");
    const closeBtn = document.getElementById("customizer-close");
    const resetBtn = document.getElementById("customizer-reset");
    const colorPicker = document.getElementById("accent-color-picker");
    const presetsWrap = document.getElementById("color-presets");

    if (!panel || !toggle || !presetsWrap) {
      return;
    }

    COLOR_PRESETS.forEach((preset) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "color-swatch";
      swatch.style.backgroundColor = preset.value;
      swatch.title = preset.name;
      swatch.setAttribute("data-accent", preset.value);
      swatch.setAttribute("aria-label", preset.name);
      presetsWrap.appendChild(swatch);
    });

    colorPicker.value = settings.accent;
    setActiveButtons("[data-theme-mode]", settings.theme, "data-theme-mode");
    setActiveButtons("[data-preview-mode]", settings.preview, "data-preview-mode");
    document
      .querySelectorAll(".color-swatch")
      .forEach((swatch) => {
        swatch.classList.toggle(
          "active",
          swatch.getAttribute("data-accent").toLowerCase() === settings.accent.toLowerCase()
        );
      });

    function openPanel() {
      panel.classList.add("open");
      overlay.classList.add("visible");
      panel.setAttribute("aria-hidden", "false");
    }

    function closePanel() {
      panel.classList.remove("open");
      overlay.classList.remove("visible");
      panel.setAttribute("aria-hidden", "true");
    }

    toggle.addEventListener("click", openPanel);
    closeBtn.addEventListener("click", closePanel);
    overlay.addEventListener("click", closePanel);

    document.querySelectorAll("[data-theme-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        settings.theme = button.getAttribute("data-theme-mode");
        applyTheme(settings.theme);
        setActiveButtons("[data-theme-mode]", settings.theme, "data-theme-mode");
        saveSettings(settings);
      });
    });

    document.querySelectorAll("[data-preview-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        settings.preview = button.getAttribute("data-preview-mode");
        applyPreview(settings.preview);
        setActiveButtons("[data-preview-mode]", settings.preview, "data-preview-mode");
        saveSettings(settings);
      });
    });

    presetsWrap.addEventListener("click", (event) => {
      const swatch = event.target.closest(".color-swatch");
      if (!swatch) {
        return;
      }

      settings.accent = swatch.getAttribute("data-accent");
      colorPicker.value = settings.accent;
      applyAccent(settings.accent);
      document.querySelectorAll(".color-swatch").forEach((item) => {
        item.classList.toggle("active", item === swatch);
      });
      saveSettings(settings);
    });

    colorPicker.addEventListener("input", (event) => {
      settings.accent = event.target.value;
      applyAccent(settings.accent);
      document.querySelectorAll(".color-swatch").forEach((item) => {
        item.classList.remove("active");
      });
      saveSettings(settings);
    });

    resetBtn.addEventListener("click", () => {
      Object.assign(settings, DEFAULTS);
      document.documentElement.removeAttribute("style");
      applySettings(settings);
      colorPicker.value = settings.accent;
      setActiveButtons("[data-theme-mode]", settings.theme, "data-theme-mode");
      setActiveButtons("[data-preview-mode]", settings.preview, "data-preview-mode");
      document.querySelectorAll(".color-swatch").forEach((item) => {
        item.classList.toggle(
          "active",
          item.getAttribute("data-accent").toLowerCase() === DEFAULTS.accent
        );
      });
      saveSettings(settings);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePanel();
      }
    });
  }

  window.GergesThemeSettings = {
    loadSettings,
    applySettings,
  };

  document.addEventListener("DOMContentLoaded", initCustomizer);
})();
