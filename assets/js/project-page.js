(function () {
  "use strict";

  const MARKER_PRIORITY = ["1-wordpress", "1-front", "1-back", "1.png", "1.jpg"];
  const LAZY_PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect width='400' height='260' fill='%23f3f4f6'/%3E%3C/svg%3E";

  let projectGalleryImages = [];
  let projectShowcaseImages = [];
  let projectThumbImages = [];
  let projectGalleryTitle = "";
  let showcaseIndex = 0;
  let modalIndex = 0;
  let galleryObserver = null;
  let showcaseLoadId = 0;
  let modalLoadId = 0;

  let imageModal;
  let modalImg;
  let modalCounter;
  let modalOverlay;
  let modalCloseBtn;
  let modalCloseTextBtn;
  let modalOpenLink;
  let modalPrevBtn;
  let modalNextBtn;

  function getLang() {
    return document.documentElement.lang === "ar" ? "ar" : "en";
  }

  function getQuerySlug() {
    return new URLSearchParams(window.location.search).get("p");
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

  function normalizeIndex(index, length) {
    if (!length) {
      return 0;
    }
    return ((index % length) + length) % length;
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
      return "wordpress";
    }
    if (lower.some(function (file) { return file.startsWith("1-front"); }) &&
        lower.some(function (file) { return file.startsWith("1-back"); })) {
      return "fullStack";
    }
    if (lower.some(function (file) { return file.startsWith("1-front"); })) {
      return "frontEnd";
    }
    return "backEnd";
  }

  function getTranslation(key) {
    const dictionary = window.GergesI18nTranslations || {};
    const lang = getLang();
    const parts = key.split(".");
    let value = dictionary[lang];

    parts.forEach(function (part) {
      value = value && value[part] !== undefined ? value[part] : null;
    });

    return value;
  }

  function destroyProjectWidgets() {
    if (galleryObserver) {
      galleryObserver.disconnect();
      galleryObserver = null;
    }
  }

  function cacheModalElements() {
    imageModal = document.getElementById("project-image-modal");
    modalImg = document.getElementById("project-image-modal-img");
    modalCounter = document.getElementById("project-image-modal-counter");
    if (!imageModal) {
      return false;
    }

    modalOverlay = imageModal.querySelector(".project-image-modal-overlay");
    modalCloseBtn = imageModal.querySelector(".project-image-modal-close");
    modalCloseTextBtn = document.getElementById("project-image-modal-close-text");
    modalOpenLink = document.getElementById("project-image-modal-open");
    modalPrevBtn = imageModal.querySelector(".project-image-modal-prev");
    modalNextBtn = imageModal.querySelector(".project-image-modal-next");
    return true;
  }

  function setImageWithLoader(targetImg, wrapper, src, onDone) {
    if (!targetImg || !src) {
      return function () {};
    }

    if (wrapper) {
      wrapper.classList.add("is-loading");
    }
    targetImg.classList.add("is-loading");

    const loader = new Image();
    let cancelled = false;

    loader.onload = function () {
      if (cancelled) {
        return;
      }
      targetImg.src = src;
      targetImg.classList.remove("is-loading");
      if (wrapper) {
        wrapper.classList.remove("is-loading");
      }
      if (typeof onDone === "function") {
        onDone(true);
      }
    };
    loader.onerror = function () {
      if (cancelled) {
        return;
      }
      targetImg.classList.remove("is-loading");
      if (wrapper) {
        wrapper.classList.remove("is-loading");
      }
      if (typeof onDone === "function") {
        onDone(false);
      }
    };
    loader.src = src;

    return function cancel() {
      cancelled = true;
      loader.onload = null;
      loader.onerror = null;
    };
  }

  function updateShowcaseCounter() {
    const showcaseCounter = document.getElementById("project-showcase-counter");
    if (showcaseCounter && projectGalleryImages.length) {
      showcaseCounter.textContent = (showcaseIndex + 1) + " / " + projectGalleryImages.length;
    }
  }

  function setShowcaseIndex(index) {
    if (!projectShowcaseImages.length) {
      return;
    }

    showcaseIndex = normalizeIndex(index, projectShowcaseImages.length);
    const showcaseImg = document.getElementById("project-showcase-img");
    const showcaseWrap = document.querySelector(".project-showcase");

    if (!showcaseImg) {
      return;
    }

    showcaseLoadId += 1;
    const loadId = showcaseLoadId;
    const fullFallback = projectGalleryImages[showcaseIndex];
    const mediumSrc = projectShowcaseImages[showcaseIndex];

    showcaseImg.alt = projectGalleryTitle + " " + (showcaseIndex + 1);
    updateShowcaseCounter();

    setImageWithLoader(showcaseImg, showcaseWrap, mediumSrc, function (ok) {
      if (loadId !== showcaseLoadId) {
        return;
      }
      if (!ok && fullFallback && showcaseImg.src !== fullFallback) {
        setImageWithLoader(showcaseImg, showcaseWrap, fullFallback);
      }
    });
  }

  function changeShowcase(step) {
    setShowcaseIndex(showcaseIndex + step);
  }

  function updateModalCounter() {
    if (modalCounter && projectGalleryImages.length) {
      modalCounter.textContent = (modalIndex + 1) + " / " + projectGalleryImages.length;
    }
  }

  function setModalIndex(index) {
    if (!projectGalleryImages.length || !modalImg) {
      return;
    }

    modalIndex = normalizeIndex(index, projectGalleryImages.length);
    modalLoadId += 1;
    const loadId = modalLoadId;
    const fullSrc = projectGalleryImages[modalIndex];
    const mediumSrc = projectShowcaseImages[modalIndex] || fullSrc;

    modalImg.alt = projectGalleryTitle + " " + (modalIndex + 1);
    updateModalCounter();

    if (modalOpenLink && fullSrc) {
      modalOpenLink.href = fullSrc;
    }

    setImageWithLoader(modalImg, imageModal, mediumSrc, function (ok) {
      if (loadId !== modalLoadId) {
        return;
      }
      if (!ok || mediumSrc === fullSrc) {
        return;
      }
      setImageWithLoader(modalImg, imageModal, fullSrc);
    });
  }

  function changeModal(step) {
    setModalIndex(modalIndex + step);
  }

  function openImageModal(index) {
    if (!cacheModalElements() || !projectGalleryImages.length) {
      return;
    }

    modalIndex = normalizeIndex(index, projectGalleryImages.length);
    setModalIndex(modalIndex);
    imageModal.classList.add("open");
    imageModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeImageModal() {
    if (!imageModal) {
      return;
    }

    imageModal.classList.remove("open");
    imageModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function bindStaticEvents() {
    const root = document.getElementById("project-page-root");
    if (!root || root.dataset.bound === "true") {
      return;
    }

    root.dataset.bound = "true";

    root.addEventListener("click", function (event) {
      if (event.target.closest(".project-showcase-prev")) {
        event.preventDefault();
        changeShowcase(-1);
        return;
      }

      if (event.target.closest(".project-showcase-next")) {
        event.preventDefault();
        changeShowcase(1);
        return;
      }

      if (event.target.closest(".project-showcase-zoom")) {
        event.preventDefault();
        openImageModal(showcaseIndex);
        return;
      }

      const thumb = event.target.closest(".project-gallery-thumb");
      if (thumb) {
        event.preventDefault();
        openImageModal(parseInt(thumb.getAttribute("data-index"), 10) || 0);
      }
    });

    let touchStartX = 0;
    root.addEventListener(
      "touchstart",
      function (event) {
        if (!event.target.closest(".project-showcase")) {
          return;
        }
        touchStartX = event.changedTouches[0].screenX;
      },
      { passive: true }
    );

    root.addEventListener(
      "touchend",
      function (event) {
        if (!event.target.closest(".project-showcase")) {
          return;
        }
        const diff = event.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) < 45) {
          return;
        }
        changeShowcase(diff > 0 ? -1 : 1);
      },
      { passive: true }
    );

    if (cacheModalElements() && imageModal.dataset.bound !== "true") {
      imageModal.dataset.bound = "true";

      modalOverlay.addEventListener("click", closeImageModal);
      modalCloseBtn.addEventListener("click", closeImageModal);
      if (modalCloseTextBtn) {
        modalCloseTextBtn.addEventListener("click", closeImageModal);
      }
      modalPrevBtn.addEventListener("click", function (event) {
        event.preventDefault();
        changeModal(-1);
      });
      modalNextBtn.addEventListener("click", function (event) {
        event.preventDefault();
        changeModal(1);
      });

      document.addEventListener("keydown", function (event) {
        if (!imageModal.classList.contains("open")) {
          return;
        }

        if (event.key === "Escape") {
          closeImageModal();
        } else if (event.key === "ArrowLeft") {
          changeModal(-1);
        } else if (event.key === "ArrowRight") {
          changeModal(1);
        }
      });

      let modalTouchStartX = 0;
      imageModal.addEventListener(
        "touchstart",
        function (event) {
          modalTouchStartX = event.changedTouches[0].screenX;
        },
        { passive: true }
      );

      imageModal.addEventListener(
        "touchend",
        function (event) {
          if (!imageModal.classList.contains("open")) {
            return;
          }
          const diff = event.changedTouches[0].screenX - modalTouchStartX;
          if (Math.abs(diff) < 45) {
            return;
          }
          changeModal(diff > 0 ? -1 : 1);
        },
        { passive: true }
      );
    }
  }

  function initLazyGalleryImages() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".project-gallery-thumb img[data-src]").forEach(function (img) {
        img.src = img.getAttribute("data-src");
      });
      return;
    }

    galleryObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          const img = entry.target;
          const src = img.getAttribute("data-src");
          const fallback = img.getAttribute("data-fallback");

          if (src) {
            img.onload = function () {
              img.removeAttribute("data-src");
              img.removeAttribute("data-fallback");
            };
            img.onerror = function () {
              if (fallback && img.src !== fallback) {
                img.src = fallback;
                return;
              }
              img.onerror = null;
            };
            img.src = src;
          }
          observer.unobserve(img);
        });
      },
      { rootMargin: "120px 0px" }
    );

    document.querySelectorAll(".project-gallery-thumb img[data-src]").forEach(function (img) {
      galleryObserver.observe(img);
    });
  }

  function renderNotFound() {
    destroyProjectWidgets();
    closeImageModal();
    projectGalleryImages = [];

    const root = document.getElementById("project-page-root");
    if (!root) {
      return;
    }

    root.innerHTML =
      '<section class="section"><div class="container text-center py-5">' +
      "<h2>" + (getTranslation("project.notFound") || "Project not found") + "</h2>" +
      '<a href="index.html#portfolio" class="btn-accent mt-4">' +
      (getTranslation("project.backPortfolio") || "Back to portfolio") +
      "</a></div></section>";
  }

  function renderProject(project) {
    destroyProjectWidgets();
    closeImageModal();

    const lang = getLang();
    const title = project.title[lang] || project.title.en;
    const description = project.description[lang] || project.description.en;
    const categoryKey = getCategoryMeta(project.files);
    const categoryLabel = getTranslation("portfolio." + categoryKey) || categoryKey;
    const gallery = project.files.map(function (file) {
      return projectMediumAsset(project.folder, file);
    });
    const showcaseSources = project.files.map(function (file) {
      return projectMediumAsset(project.folder, file);
    });
    const thumbSources = project.files.map(function (file) {
      return projectThumbAsset(project.folder, file);
    });

    projectGalleryImages = gallery.slice();
    projectShowcaseImages = showcaseSources.slice();
    projectThumbImages = thumbSources.slice();
    projectGalleryTitle = title;
    showcaseIndex = 0;
    modalLoadId = 0;
    showcaseLoadId = 0;

    document.title = title + " | Gerges Hanna";

    const root = document.getElementById("project-page-root");

    const stackItems = (project.stack || [])
      .map(function (item) {
        return "<li>" + item + "</li>";
      })
      .join("");

    const galleryItems = gallery
      .map(function (src, index) {
        const thumbSrc = projectThumbImages[index] || src;
        const fallbackSrc = projectShowcaseImages[index] || src;
        return (
          '<button type="button" class="project-gallery-thumb" data-index="' + index + '" aria-label="' + title + " " + (index + 1) + '">' +
          '<img src="' + LAZY_PLACEHOLDER + '" data-src="' + thumbSrc + '" data-fallback="' + fallbackSrc + '" alt="' + title + " " + (index + 1) + '" loading="lazy" decoding="async">' +
          "</button>"
        );
      })
      .join("");

    root.innerHTML =
      '<section class="project-page-hero">' +
        '<div class="container">' +
          '<nav class="breadcrumbs mb-3">' +
            '<ol>' +
              '<li><a href="index.html" data-i18n="nav.home">Home</a></li>' +
              '<li><a href="index.html#portfolio" data-i18n="nav.portfolio">Portfolio</a></li>' +
              "<li class=\"current\">" + title + "</li>" +
            "</ol>" +
          "</nav>" +
          "<h1>" + title + "</h1>" +
          '<p class="lead mb-0">' + description + "</p>" +
          '<div class="project-page-meta">' +
            '<span class="project-page-badge"><i class="bi bi-tag"></i> ' + categoryLabel + "</span>" +
            '<span class="project-page-badge"><i class="bi bi-images"></i> ' + gallery.length + " " + (getTranslation("project.screens") || "screens") + "</span>" +
          "</div>" +
          '<div class="project-page-actions">' +
            '<a href="#project-gallery" class="btn-accent"><i class="bi bi-eye me-2"></i>' + (getTranslation("project.viewGallery") || "View Gallery") + "</a>" +
            '<a href="index.html#contact" class="btn-outline"><i class="bi bi-envelope me-2"></i>' + (getTranslation("project.contact") || "Contact") + "</a>" +
            '<a href="index.html#portfolio" class="btn-outline"><i class="bi bi-arrow-left me-2"></i>' + (getTranslation("project.backPortfolio") || "Back to portfolio") + "</a>" +
          "</div>" +
        "</div>" +
      "</section>" +
      '<section class="section project-showcase-section">' +
        '<div class="container">' +
          '<div class="row gy-4">' +
            '<div class="col-12 col-lg-8">' +
              '<div class="project-showcase">' +
                '<img id="project-showcase-img" src="' + LAZY_PLACEHOLDER + '" alt="' + title + '" decoding="async" fetchpriority="high">' +
                '<button type="button" class="project-showcase-nav project-showcase-prev" aria-label="Previous"><i class="bi bi-chevron-left"></i></button>' +
                '<button type="button" class="project-showcase-nav project-showcase-next" aria-label="Next"><i class="bi bi-chevron-right"></i></button>' +
                '<span id="project-showcase-counter" class="project-showcase-counter">1 / ' + gallery.length + "</span>" +
                '<div class="project-showcase-actions">' +
                  '<button type="button" class="project-showcase-zoom" aria-label="Open gallery"><i class="bi bi-zoom-in"></i></button>' +
                "</div>" +
              "</div>" +
            "</div>" +
            '<div class="col-12 col-lg-4">' +
              "<h3 data-i18n=\"project.infoTitle\">Project information</h3>" +
              "<ul class=\"list-unstyled lh-lg project-info-list\">" +
                "<li><strong data-i18n=\"project.category\">Category</strong>: " + categoryLabel + "</li>" +
                "<li><strong data-i18n=\"project.type\">Type</strong>: " + (project.tag[lang] || project.tag.en) + "</li>" +
                "<li><strong data-i18n=\"project.images\">Images</strong>: " + gallery.length + "</li>" +
              "</ul>" +
              "<h4 class=\"mt-4\" data-i18n=\"project.stack\">Technologies</h4>" +
              '<ul class="project-stack-list">' + stackItems + "</ul>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</section>" +
      '<section id="project-gallery" class="section light-background">' +
        '<div class="container">' +
          "<h2 class=\"mb-4\" data-i18n=\"project.galleryTitle\">Project Gallery</h2>" +
          '<div id="project-gallery-grid" class="project-gallery-grid">' + galleryItems + "</div>" +
        "</div>" +
      "</section>";

    if (window.GergesI18n && typeof window.GergesI18n.applyLanguage === "function") {
      window.GergesI18n.applyLanguage(lang);
      document.title = title + " | Gerges Hanna";
    }

    initLazyGalleryImages();
    const coverFile = getCoverFile(project.files);
    const coverIndex = project.files.indexOf(coverFile);
    setShowcaseIndex(coverIndex >= 0 ? coverIndex : 0);
  }

  function initProjectPage() {
    bindStaticEvents();

    const slug = getQuerySlug();
    const project = (window.GergesProjects || []).find(function (item) {
      return item.slug === slug;
    });

    if (!project) {
      renderNotFound();
      return;
    }

    renderProject(project);
  }

  window.GergesProjectPage = {
    refresh: initProjectPage,
  };

  document.addEventListener("DOMContentLoaded", initProjectPage);
})();
