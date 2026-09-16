(function () {
  "use strict";

  const STORAGE_KEY = "gerges-profile-settings";
  const DEFAULT_LANG = "en";
  let typedInstance = null;

  const CONTACT = {
    email: "gergeshana2023@gmail.com",
    phone: "01142585940",
    whatsapp: "201142585940",
  };

  const translations = {
    en: {
      meta: {
        title: "Gerges Hanna | Portfolio",
      },
      nav: {
        home: "Home",
        about: "About",
        services: "Services",
        portfolio: "Portfolio",
        contact: "Contact",
      },
      hero: {
        tagline: "PHP Laravel Back-End Developer.",
        badge1: "PHP Laravel Backend Developer with 3+ years of experience",
        badge2: "Full Stack Web Developer",
        badge3: "Freelancer",
        typed: "Laravel, PHP, MySQL, REST API",
        emailLabel: "Email:",
        phoneLabel: "WhatsApp:",
        downloadCv: "Download CV",
      },
      about: {
        skills: "Skills",
        title: "About me",
        p1: "Full Stack PHP Laravel Developer with 3+ years of experience building scalable web applications, RESTful APIs, and business systems for clients in Egypt, Saudi Arabia, and the UAE.",
        p2: "I develop CRM and POS platforms, warehouse management systems, and real-time order tracking solutions using Laravel, PHP, GraphQL, Firebase, and SQL Server—with integrations like Deliverect and Urbanpiper.",
        p3: "Strong in database design, query optimization, Git workflows, and DevOps practices including Windows Server deployment, Docker-ready architectures, API testing with Postman, and Excel-based data migration for large datasets. ITI Full Stack PHP graduate (MCIT) with a Bachelor's in Computer Science from Beni Suef University.",
        widgetRevenue: "Revenue",
        widgetGrowth: "Growth",
        widgetAnalytics: "Analytics",
        widgetRequests: "API Requests",
      },
      resume: {
        title: "Resume",
        summary: "Summary",
        summaryText: "Full Stack PHP professional with 3+ years of experience delivering end-to-end web solutions. Skilled in Laravel, REST/GraphQL APIs, Firebase, SQL Server, and third-party integrations for POS, CRM, and warehouse systems.",
        work: "Work Experience",
        education: "Education",
        certifications: "Certifications & Training",
        volunteering: "Volunteering",
      },
      services: {
        title: "Services",
        hosting: "Hosting & Domains",
        hostingDesc: "Server setup, domain configuration, SSL certificates, and reliable hosting for business websites and web apps. I help clients launch fast, secure sites with uptime monitoring and backup plans tailored to real market needs.",
        wordpress: "WordPress Development",
        wordpressDesc: "Custom WordPress themes, plugins, speed optimization, and secure deployments for blogs, stores, and corporate sites. Ideal for clients who need a flexible CMS with professional performance and easy content management.",
        laravel: "Laravel & APIs",
        laravelDesc: "Scalable Laravel backends, REST and GraphQL APIs, database design, and POS/CRM integrations from real production experience. Perfect for startups and companies that need robust business logic beyond a simple website.",
        devops: "DevOps & Server Admin",
        devopsDesc: "Windows Server deployment, Git workflows, Docker-ready architecture, API testing with Postman, and large data migrations. I keep your stack stable, monitored, and ready to grow as traffic and integrations increase.",
        contactBtn: "Contact Me",
        stats: {
          hosting: { a: "99.9% Uptime", b: "SSL Ready" },
          wordpress: { a: "Fast Load", b: "SEO Ready" },
          laravel: { a: "REST API", b: "GraphQL" },
          devops: { a: "24/7 Monitor", b: "Git CI/CD" },
        },
      },
      portfolio: {
        title: "Portfolio",
        all: "All",
        backEnd: "Back End",
        frontEnd: "Front End",
        fullStack: "Full Stack",
        wordpress: "WordPress",
      },
      project: {
        infoTitle: "Project information",
        category: "Category",
        type: "Type",
        images: "Images",
        stack: "Technologies",
        galleryTitle: "Project Gallery",
        viewGallery: "View Gallery",
        contact: "Contact",
        backPortfolio: "Back to portfolio",
        screens: "screens",
        prev: "Previous",
        next: "Next",
      },
      contact: {
        title: "Contact",
        addressTitle: "Address",
        address: "Cairo - Egypt",
        emailTitle: "Email Us",
        phoneTitle: "WhatsApp",
        namePlaceholder: "Your Name",
        emailPlaceholder: "Your Email",
        subjectPlaceholder: "Subject",
        messagePlaceholder: "Message",
        send: "Send Message",
        loading: "Loading",
        sent: "Your message has been sent. Thank you!",
        error: "There was an error sending your message. Please try again later.",
      },
      social: {
        title: "Join Us",
        subtitle: "Follow us on social networks",
      },
      lightbox: {
        open: "Open",
        close: "Close",
      },
      customizer: {
        title: "Customize",
        mode: "Theme Mode",
        light: "Light",
        dark: "Dark",
        accent: "Accent Color",
        customColor: "Custom color",
        preview: "Screen Preview",
        mobile: "Mobile",
        tablet: "Tablet",
        desktop: "Desktop",
        note: "Preview how the layout looks at different screen widths.",
        reset: "Reset to defaults",
      },
    },
    ar: {
      meta: {
        title: "جرجس حنا | Portfolio",
      },
      nav: {
        home: "الرئيسية",
        about: "نبذة",
        services: "الخدمات",
        portfolio: "الأعمال",
        contact: "تواصل",
      },
      hero: {
        tagline: "مطور PHP Laravel Back-End.",
        badge1: "مطور PHP Laravel Backend بخبرة أكثر من 3 سنوات",
        badge2: "مطور Full Stack",
        badge3: "فريلانسر",
        typed: "Laravel, PHP, MySQL, REST API",
        emailLabel: "البريد:",
        phoneLabel: "واتساب:",
        downloadCv: "تحميل السيرة الذاتية",
      },
      about: {
        skills: "المهارات",
        title: "نبذة عني",
        p1: "مطور Full Stack PHP Laravel بخبرة أكثر من 3 سنوات في بناء تطبيقات ويب قابلة للتوسع وRESTful APIs وأنظمة أعمال لعملاء في مصر والسعودية والإمارات.",
        p2: "أطور منصات CRM وPOS وأنظمة إدارة مخازن وتتبع طلبات لحظي باستخدام Laravel وPHP وGraphQL وFirebase وSQL Server، مع تكاملات Deliverect وUrbanpiper.",
        p3: "خبرة قوية في تصميم قواعد البيانات وتحسين الاستعلامات وGit وDevOps بما في ذلك النشر على Windows Server وبنية جاهزة لـ Docker واختبار APIs عبر Postman ونقل بيانات ضخمة عبر Excel. خريج ITI Full Stack PHP (MCIT) وبكالوريوس علوم حاسب من جامعة بني سويف.",
        widgetRevenue: "الإيرادات",
        widgetGrowth: "النمو",
        widgetAnalytics: "التحليلات",
        widgetRequests: "طلبات API",
      },
      resume: {
        title: "السيرة الذاتية",
        summary: "ملخص",
        summaryText: "مطور Full Stack PHP بخبرة أكثر من 3 سنوات في تقديم حلول ويب متكاملة. متمكن في Laravel وREST/GraphQL APIs وFirebase وSQL Server وتكاملات POS وCRM وأنظمة المخازن.",
        work: "الخبرة العملية",
        education: "التعليم",
        certifications: "الشهادات والتدريب",
        volunteering: "التطوع",
      },
      services: {
        title: "الخدمات",
        hosting: "الاستضافة والدومينات",
        hostingDesc: "إعداد السيرفرات، ربط الدومينات، شهادات SSL، واستضافة موثوقة للمواقع والتطبيقات. أساعد العملاء على إطلاق مواقع سريعة وآمنة مع مراقبة التشغيل وخطط نسخ احتياطي مناسبة لاحتياجات السوق.",
        wordpress: "تطوير WordPress",
        wordpressDesc: "قوالب وإضافات WordPress مخصصة، تحسين السرعة، ونشر آمن للمدونات والمتاجر والمواقع المؤسسية. مناسب لمن يحتاج CMS مرن بأداء احترافي وإدارة محتوى سهلة.",
        laravel: "Laravel وواجهات API",
        laravelDesc: "Back-end قابل للتوسع بـ Laravel، REST وGraphQL APIs، تصميم قواعد بيانات، وتكاملات POS وCRM من خبرة إنتاج حقيقية. مثالي للشركات التي تحتاج منطق أعمال قوي يتجاوز موقعاً بسيطاً.",
        devops: "DevOps وإدارة السيرفرات",
        devopsDesc: "نشر على Windows Server، Git workflows، بنية جاهزة لـ Docker، اختبار APIs عبر Postman، ونقل بيانات ضخمة. أحافظ على استقرار نظامك وجاهزيته للنمو مع زيادة الزيارات والتكاملات.",
        contactBtn: "تواصل معي",
        stats: {
          hosting: { a: "99.9% تشغيل", b: "SSL جاهز" },
          wordpress: { a: "تحميل سريع", b: "SEO جاهز" },
          laravel: { a: "REST API", b: "GraphQL" },
          devops: { a: "مراقبة 24/7", b: "Git CI/CD" },
        },
      },
      portfolio: {
        title: "معرض الأعمال",
        all: "الكل",
        backEnd: "Back End",
        frontEnd: "Front End",
        fullStack: "Full Stack",
        wordpress: "WordPress",
      },
      project: {
        infoTitle: "معلومات المشروع",
        category: "التصنيف",
        type: "النوع",
        images: "الصور",
        stack: "التقنيات",
        galleryTitle: "معرض المشروع",
        viewGallery: "عرض المعرض",
        contact: "تواصل",
        backPortfolio: "العودة للأعمال",
        screens: "شاشة",
        notFound: "المشروع غير موجود",
        prev: "السابق",
        next: "التالي",
      },
      contact: {
        title: "تواصل معنا",
        addressTitle: "العنوان",
        address: "القاهرة - مصر",
        emailTitle: "راسلنا",
        phoneTitle: "واتساب",
        namePlaceholder: "اسمك",
        emailPlaceholder: "بريدك الإلكتروني",
        subjectPlaceholder: "الموضوع",
        messagePlaceholder: "الرسالة",
        send: "إرسال الرسالة",
        loading: "جاري الإرسال",
        sent: "تم إرسال رسالتك بنجاح. شكراً لك!",
        error: "حدث خطأ أثناء الإرسال. حاول مرة أخرى.",
      },
      social: {
        title: "تابعنا",
        subtitle: "تابعنا على شبكات التواصل",
      },
      lightbox: {
        open: "فتح",
        close: "إغلاق",
      },
      customizer: {
        title: "تخصيص الموقع",
        mode: "الوضع",
        light: "فاتح",
        dark: "داكن",
        accent: "لون التمييز",
        customColor: "لون مخصص",
        preview: "معاينة الشاشة",
        mobile: "موبايل",
        tablet: "تابلت",
        desktop: "ديسكتوب",
        note: "شوف شكل الموقع على مقاسات مختلفة قبل ما تنشره.",
        reset: "إعادة الضبط",
      },
    },
  };

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveLang(lang) {
    const settings = loadSettings();
    settings.lang = lang;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function getNestedValue(object, path) {
    return path.split(".").reduce(function (current, key) {
      return current && current[key] !== undefined ? current[key] : null;
    }, object);
  }

  function destroyTyped() {
    if (typedInstance && typeof typedInstance.destroy === "function") {
      typedInstance.destroy();
      typedInstance = null;
    }
  }

  function initTyped(lang) {
    const typedElement = document.querySelector(".typed");
    if (!typedElement || typeof Typed === "undefined") {
      return;
    }

    const strings = getNestedValue(translations[lang], "hero.typed")
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);

    typedElement.setAttribute("data-typed-items", strings.join(","));
    destroyTyped();
    typedInstance = new Typed(".typed", {
      strings: strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000,
    });
  }

  function applyLanguage(lang) {
    const dictionary = translations[lang] || translations.en;
    const root = document.documentElement;

    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("lang-ar", lang === "ar");
    document.title = dictionary.meta.title;

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      const key = element.getAttribute("data-i18n");
      const value = getNestedValue(dictionary, key);
      if (value !== null) {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
      const key = element.getAttribute("data-i18n-placeholder");
      const value = getNestedValue(dictionary, key);
      if (value !== null) {
        element.setAttribute("placeholder", value);
      }
    });

    document.querySelectorAll(".lang-btn").forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-lang") === lang);
    });

    initTyped(lang);

    if (window.GergesServicesModal && typeof window.GergesServicesModal.refresh === "function") {
      window.GergesServicesModal.refresh();
    }

    if (window.GergesPortfolio && typeof window.GergesPortfolio.refresh === "function") {
      window.GergesPortfolio.refresh();
    }

    if (window.GergesProjectPage && typeof window.GergesProjectPage.refresh === "function") {
      window.GergesProjectPage.refresh();
    }

    saveLang(lang);
  }

  function initLanguage() {
    const settings = loadSettings();
    const lang = settings.lang === "ar" ? "ar" : DEFAULT_LANG;
    applyLanguage(lang);

    document.querySelectorAll(".lang-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        applyLanguage(button.getAttribute("data-lang"));
      });
    });
  }

  window.GergesI18nTranslations = translations;

  window.GergesI18n = {
    applyLanguage: applyLanguage,
    CONTACT: CONTACT,
  };

  document.addEventListener("DOMContentLoaded", initLanguage);
})();
