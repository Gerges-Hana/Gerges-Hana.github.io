(function () {
  "use strict";

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function formatNumber(value) {
    return value.toLocaleString("en-US");
  }

  function initRevenueWidget(widget) {
    const valueEl = widget.querySelector(".about-stat-value");
    const percentEl = widget.querySelector(".about-stat-percent");
    if (!valueEl || !percentEl) {
      return;
    }

    const prefix = valueEl.dataset.prefix || "";
    let current = Number(valueEl.dataset.target || 12840);

    function tick() {
      const delta = randomBetween(-420, 680);
      current = Math.max(9800, Math.min(16800, current + delta));
      valueEl.textContent = prefix + formatNumber(current);
      percentEl.textContent = (randomBetween(142, 224) / 10).toFixed(1);
    }

    tick();
    setInterval(tick, 3200);
  }

  function initGrowthWidget(widget) {
    const bars = widget.querySelectorAll(".about-mini-bar");
    if (!bars.length) {
      return;
    }

    function tick() {
      bars.forEach(function (bar) {
        const height = randomBetween(35, 100);
        bar.style.height = height + "%";
      });
    }

    tick();
    setInterval(tick, 2600);
  }

  function initSparklineWidget(widget) {
    const path = widget.querySelector(".about-sparkline-path");
    if (!path) {
      return;
    }

    const points = [
      [0, 26],
      [12, 20],
      [24, 10],
      [36, 16],
      [48, 8],
      [60, 14],
      [72, 6],
      [80, 12],
    ];

    function buildPath(data) {
      return data
        .map(function (point, index) {
          return (index === 0 ? "M" : "L") + point[0] + " " + point[1];
        })
        .join(" ");
    }

    function tick() {
      const next = points.map(function (point, index) {
        if (index === 0 || index === points.length - 1) {
          return [point[0], Math.max(4, Math.min(28, point[1] + randomBetween(-2, 2)))];
        }
        return [point[0], randomBetween(5, 26)];
      });

      path.setAttribute("d", buildPath(next));
      path.style.strokeDasharray = "120";
      path.style.strokeDashoffset = "120";
      requestAnimationFrame(function () {
        path.style.transition = "stroke-dashoffset 1.2s ease, d 1.2s ease";
        path.style.strokeDashoffset = "0";
      });
    }

    tick();
    setInterval(tick, 3400);
  }

  function initCounterWidget(widget) {
    const valueEl = widget.querySelector(".about-stat-value");
    if (!valueEl) {
      return;
    }

    let current = Number(valueEl.dataset.target || 248);
    const suffix = valueEl.dataset.suffix || "";

    function tick() {
      current = Math.max(180, Math.min(420, current + randomBetween(-18, 24)));
      valueEl.textContent = formatNumber(current) + suffix;
    }

    tick();
    setInterval(tick, 2800);
  }

  function initAboutWidgets() {
    const scene = document.querySelector(".about-photo-scene");
    if (!scene) {
      return;
    }

    scene.querySelectorAll(".about-widget-revenue").forEach(initRevenueWidget);
    scene.querySelectorAll(".about-widget-growth").forEach(initGrowthWidget);
    scene.querySelectorAll(".about-widget-sparkline").forEach(initSparklineWidget);
    scene.querySelectorAll(".about-widget-requests").forEach(initCounterWidget);
  }

  document.addEventListener("DOMContentLoaded", initAboutWidgets);
})();
