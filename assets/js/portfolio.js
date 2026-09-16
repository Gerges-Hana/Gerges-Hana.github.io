(function () {
  "use strict";

  const MARKER_PRIORITY = ["1-wordpress", "1-front", "1-back", "1.png", "1.jpg"];
  const FLOAT_VARIANTS = 8;
  const MAX_FLOAT_IMAGES = 10;
  const HOVER_CLOSE_DELAY = 120;

  let hoverModal;
  let hoverImagesEl;
  let hoverTitleEl;
  let hoverTagEl;
  let hoverTimer = null;
  let cycleTimer = null;
  let activeItem = null;
  let activeGallery = [];

  let zoomModal;
  let zoomImg;
  let zoomOpenLink;
  let zoomCounter;
  let zoomGalleryFull = [];
  let zoomGalleryMedium = [];
  let zoomIndex = 0;

  function getLang() {
    return document.documentElement.lang === "ar" ? "ar" : "en";
  }

  function projectAsset(folder, file) {
    return "projects/" + encodeURIComponent(folder) + "/" + encodeURIComponent(file);
  }

  function projectDerivedAsset(folder, file, sizeFolder) {
    const base = file.replace(/\.[^.]+$/, ".webp");
    return "projects/" + encodeURIComponent(folder) + "/" + sizeFolder + "/" + encodeURIComponent(base);
  }

  function projectThumbAsset(folder, file) {
    return projectDerivedAsset(folder, file, "thumbs");
  }

  function projectMediumAsset(folder, file) {
    return projectDerivedAsset(folder, file, "medium");
  }

  function getCoverFile(files) {
    const markers = files.filter(function (file) {
      const lower = file.toLowerCase();
      return /^1[-.]/.test(lower) || lower === "1.png" || lower === "1.jpg";
    });

    for (let i = 0; i < MARKER_PRIORITY.length; i += 1) {
      const prefix = MARKER_PRIORITY[i];
      const match = markers.find(function (file) {
        return file.toLowerCase().startsWith(prefix);
      });
      if (match) {
        return match;
      }
    }

    return files[0];
  }

  function getCategoryMeta(files) {
    const lower = files.map(function (file) {
      return file.toLowerCase();
    });

    if (lower.some(function (file) { return file.startsWith("1-wordpress"); })) {
      return { classes: "filter-WordPress", key: "wordpress" };
    }

    const hasFront = lower.some(function (file) { return file.startsWith("1-front"); });
    const hasBack = lower.some(function (file) { return file.startsWith("1-back"); });

    if (hasFront && hasBack) {
      return { classes: "filter-FullStack filter-Front filter-Back", key: "fullStack" };
    }
    if (hasFront) {
      return { classes: "filter-Front", key: "frontEnd" };
    }
    if (hasBack) {
      return { classes: "filter-Back", key: "backEnd" };
    }

    return { classes: "filter-Front", key: "frontEnd" };
  }

  function getCategoryLabel(key) {
    const dictionary = window.GergesI18nTranslations || {};
    const lang = getLang();
    const portfolio = dictionary[lang] && dictionary[lang].portfolio;
    return portfolio && portfolio[key] ? portfolio[key] : key;
  }

  function buildPortfolioItem(project, index) {
    const lang = getLang();
    const category = getCategoryMeta(project.files);
    const coverFile = getCoverFile(project.files);
    const coverSrc = projectThumbAsset(project.folder, coverFile);
    const coverFallback = projectMediumAsset(project.folder, coverFile);
    const gallery = project.files.map(function (file) {
      return projectMediumAsset(project.folder, file);
    });
    const galleryFull = project.files.map(function (file) {
      return projectMediumAsset(project.folder, file);
    });
    const title = project.title[lang] || project.title.en;
    const tag = project.tag[lang] || project.tag.en;
    const categoryLabel = getCategoryLabel(category.key);

    return (
      '<div class="col-12 col-lg-4 portfolio-item ' + category.classes + '" ' +
        'data-project-slug="' + project.slug + '" ' +
        'data-project-title="' + title.replace(/"/g, "&quot;") + '" ' +
        'data-project-tag="' + (tag + " · " + categoryLabel).replace(/"/g, "&quot;") + '" ' +
        "data-gallery='" + JSON.stringify(gallery) + "' " +
        "data-gallery-full='" + JSON.stringify(galleryFull) + "'>" +
        '<a href="project.html?p=' + project.slug + '" class="portfolio-item-link" aria-label="' + title.replace(/"/g, "&quot;") + '"></a>' +
        '<div class="portfolio-visual">' +
          '<img src="' + coverSrc + '" data-fallback="' + coverFallback + '" class="portfolio-cover img-fluid" alt="' + title + '" loading="lazy" decoding="async">' +
        "</div>" +
        '<div class="portfolio-info">' +
          "<h4>" + title + "</h4>" +
          "<p>" + tag + " · " + categoryLabel + "</p>" +
          '<button type="button" class="preview-link portfolio-zoom-trigger" aria-label="Zoom in" data-index="0">' +
          '<i class="bi bi-zoom-in"></i></button>' +
          '<a href="project.html?p=' + project.slug + '" class="details-link" title="' + title + '"><i class="bi bi-link-45deg"></i></a>' +
        "</div>" +
      "</div>"
    );
  }

  function normalizeIndex(index, length) {
    if (!length) {
      return 0;
    }
    return ((index % length) + length) % length;
  }

  function closePortfolioZoomModal() {
    if (!zoomModal) {
      return;
    }

    zoomModal.classList.remove("open");
    zoomModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    zoomGalleryFull = [];
    zoomGalleryMedium = [];
  }

  function updatePortfolioZoomView() {
    if (!zoomImg || !zoomGalleryMedium.length) {
      return;
    }

    zoomIndex = normalizeIndex(zoomIndex, zoomGalleryMedium.length);
    zoomImg.src = zoomGalleryMedium[zoomIndex];
    zoomImg.alt = "Project image " + (zoomIndex + 1);

    if (zoomOpenLink && zoomGalleryFull[zoomIndex]) {
      zoomOpenLink.href = zoomGalleryFull[zoomIndex];
    }

    if (zoomCounter) {
      zoomCounter.textContent = (zoomIndex + 1) + " / " + zoomGalleryMedium.length;
    }

    const prevBtn = zoomModal.querySelector(".portfolio-zoom-prev");
    const nextBtn = zoomModal.querySelector(".portfolio-zoom-next");
    const showNav = zoomGalleryMedium.length > 1;

    if (prevBtn) {
      prevBtn.style.display = showNav ? "" : "none";
    }

    if (nextBtn) {
      nextBtn.style.display = showNav ? "" : "none";
    }
  }

  function openPortfolioZoomModal(item, startIndex) {
    if (!zoomModal || !item) {
      return;
    }

    try {
      zoomGalleryMedium = JSON.parse(item.getAttribute("data-gallery") || "[]");
      zoomGalleryFull = JSON.parse(item.getAttribute("data-gallery-full") || "[]");
    } catch (error) {
      return;
    }

    if (!zoomGalleryMedium.length) {
      return;
    }

    zoomIndex = normalizeIndex(startIndex || 0, zoomGalleryMedium.length);
    updatePortfolioZoomView();
    zoomModal.classList.add("open");
    zoomModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function initPortfolioZoomModal() {
    zoomModal = document.getElementById("portfolio-zoom-modal");
    zoomImg = document.getElementById("portfolio-zoom-img");
    zoomOpenLink = document.getElementById("portfolio-zoom-open");
    zoomCounter = document.getElementById("portfolio-zoom-counter");

    if (!zoomModal || zoomModal.dataset.bound === "true") {
      return;
    }

    zoomModal.dataset.bound = "true";

    const overlay = zoomModal.querySelector(".portfolio-zoom-overlay");
    const closeBtn = document.getElementById("portfolio-zoom-close");
    const prevBtn = zoomModal.querySelector(".portfolio-zoom-prev");
    const nextBtn = zoomModal.querySelector(".portfolio-zoom-next");

    document.addEventListener("click", function (event) {
      const trigger = event.target.closest(".portfolio-zoom-trigger");
      if (!trigger) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const item = trigger.closest(".portfolio-item");
      if (!item) {
        return;
      }

      openPortfolioZoomModal(item, parseInt(trigger.getAttribute("data-index"), 10) || 0);
    });

    if (overlay) {
      overlay.addEventListener("click", closePortfolioZoomModal);
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closePortfolioZoomModal);
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function (event) {
        event.preventDefault();
        zoomIndex -= 1;
        updatePortfolioZoomView();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function (event) {
        event.preventDefault();
        zoomIndex += 1;
        updatePortfolioZoomView();
      });
    }

    document.addEventListener("keydown", function (event) {
      if (!zoomModal.classList.contains("open")) {
        return;
      }

      if (event.key === "Escape") {
        closePortfolioZoomModal();
      } else if (event.key === "ArrowLeft") {
        zoomIndex -= 1;
        updatePortfolioZoomView();
      } else if (event.key === "ArrowRight") {
        zoomIndex += 1;
        updatePortfolioZoomView();
      }
    });
  }

  function initPortfolioImageFallbacks() {
    document.querySelectorAll(".portfolio-cover[data-fallback]").forEach(function (img) {
      img.addEventListener("error", function () {
        const fallback = img.getAttribute("data-fallback");
        if (fallback && img.src !== fallback) {
          img.src = fallback;
        }
      }, { once: true });
    });
  }

  function clearHoverTimers() {
    window.clearTimeout(hoverTimer);
    window.clearInterval(cycleTimer);
    hoverTimer = null;
    cycleTimer = null;
  }

  function buildFloatingImages(gallery) {
    if (!hoverImagesEl) {
      return;
    }

    const slots = Math.min(MAX_FLOAT_IMAGES, gallery.length);
    let html = "";

    for (let i = 0; i < slots; i += 1) {
      const src = gallery[i % gallery.length];
      html +=
        '<img class="portfolio-float-img variant-' + (i % FLOAT_VARIANTS) + '" src="' + src + '" alt="" loading="lazy" data-slot="' + i + '">';
    }

    hoverImagesEl.innerHTML = html;
  }

  function cycleFloatingImages() {
    if (!hoverImagesEl || activeGallery.length < 2) {
      return;
    }

    let step = 0;
    cycleTimer = window.setInterval(function () {
      if (!hoverModal.classList.contains("open")) {
        return;
      }

      step += 1;
      hoverImagesEl.querySelectorAll(".portfolio-float-img").forEach(function (img, index) {
        img.src = activeGallery[(step + index) % activeGallery.length];
      });
    }, 2200);
  }

  function openHoverModal(item) {
    if (!hoverModal || !item) {
      return;
    }

    let gallery;
    try {
      gallery = JSON.parse(item.getAttribute("data-gallery"));
    } catch (error) {
      return;
    }

    if (!gallery.length) {
      return;
    }

    clearHoverTimers();
    activeItem = item;
    activeGallery = gallery;

    hoverTitleEl.textContent = item.getAttribute("data-project-title") || "";
    hoverTagEl.textContent = item.getAttribute("data-project-tag") || "";
    buildFloatingImages(gallery);

    hoverModal.classList.add("open");
    hoverModal.setAttribute("aria-hidden", "false");
    cycleFloatingImages();
  }

  function closeHoverModal() {
    if (!hoverModal) {
      return;
    }

    hoverModal.classList.remove("open");
    hoverModal.setAttribute("aria-hidden", "true");
    activeItem = null;
    activeGallery = [];
    clearHoverTimers();

    window.setTimeout(function () {
      if (!hoverModal.classList.contains("open") && hoverImagesEl) {
        hoverImagesEl.innerHTML = "";
      }
    }, 350);
  }

  function scheduleCloseHoverModal() {
    clearHoverTimers();
    hoverTimer = window.setTimeout(closeHoverModal, HOVER_CLOSE_DELAY);
  }

  function initPortfolioHoverModal() {
    hoverModal = document.getElementById("portfolio-hover-modal");
    if (!hoverModal) {
      return;
    }

    hoverImagesEl = document.getElementById("portfolio-hover-images");
    hoverTitleEl = document.getElementById("portfolio-hover-title");
    hoverTagEl = document.getElementById("portfolio-hover-tag");

    document.querySelectorAll(".portfolio-item[data-gallery]").forEach(function (item) {
      if (item.dataset.hoverBound === "true") {
        return;
      }

      item.dataset.hoverBound = "true";

      item.addEventListener("mouseenter", function () {
        clearHoverTimers();
        openHoverModal(item);
      });

      item.addEventListener("mouseleave", function () {
        scheduleCloseHoverModal();
      });

      item.addEventListener("focusin", function () {
        openHoverModal(item);
      });

      item.addEventListener("focusout", function () {
        scheduleCloseHoverModal();
      });
    });
  }

  function renderPortfolio() {
    const container = document.querySelector(".portfolio .isotope-container");
    const projects = window.GergesProjects || [];

    if (!container || !projects.length) {
      return;
    }

    closeHoverModal();
    container.innerHTML = projects.map(buildPortfolioItem).join("");
    initPortfolioImageFallbacks();
    initPortfolioHoverModal();
    initPortfolioZoomModal();
    initPortfolioFilters();
  }

  function applyPortfolioFilter(filterValue) {
    const container = document.querySelector(".portfolio .isotope-container");
    if (!container) {
      return;
    }

    const filterClass = filterValue === "*" ? "*" : filterValue.replace(/^\./, "");

    container.querySelectorAll(".portfolio-item").forEach(function (item) {
      const shouldShow = filterClass === "*" || item.classList.contains(filterClass);
      item.classList.toggle("portfolio-filter-hidden", !shouldShow);
    });
  }

  function initPortfolioFilters() {
    const isotopeLayout = document.querySelector(".portfolio .isotope-layout");
    if (!isotopeLayout) {
      return;
    }

    if (window.portfolioIsotope && typeof window.portfolioIsotope.destroy === "function") {
      window.portfolioIsotope.destroy();
      window.portfolioIsotope = null;
    }

    isotopeLayout.querySelectorAll(".portfolio-filters li").forEach(function (filterButton) {
      if (filterButton.dataset.portfolioBound === "true") {
        return;
      }

      filterButton.dataset.portfolioBound = "true";
      filterButton.addEventListener("click", function () {
        isotopeLayout.querySelector(".portfolio-filters .filter-active").classList.remove("filter-active");
        filterButton.classList.add("filter-active");
        applyPortfolioFilter(filterButton.getAttribute("data-filter"));
      });
    });

    const activeFilter = isotopeLayout.querySelector(".portfolio-filters .filter-active");
    applyPortfolioFilter(activeFilter ? activeFilter.getAttribute("data-filter") : "*");
  }

  window.GergesPortfolio = {
    refresh: renderPortfolio,
  };

  document.addEventListener("DOMContentLoaded", function () {
    initPortfolioZoomModal();
    renderPortfolio();
  });
})();
