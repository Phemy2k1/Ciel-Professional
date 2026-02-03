// =========================
// app.js (shared for all pages)
// =========================

document.addEventListener("DOMContentLoaded", () => {

  // -------------------------
  // Mobile Nav Toggle
  // -------------------------
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      navToggle.textContent = isOpen ? "✕" : "☰";
    });

    // Close nav when clicking a link (mobile)
    mainNav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        if (mainNav.classList.contains("is-open")) {
          mainNav.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.textContent = "☰";
        }
      });
    });
  }


  // -------------------------
  // Home page search redirect
  // index.html => courses.html?q=...
  // -------------------------
  const homeSearch = document.getElementById("homeSearch");
  const homeSearchBtn = document.getElementById("homeSearchBtn");

  function goToCourseSearch() {
    if (!homeSearch) return;
    const q = homeSearch.value.trim();
    const url = q ? `courses.html?q=${encodeURIComponent(q)}` : "courses.html";
    window.location.href = url;
  }

  if (homeSearchBtn) homeSearchBtn.addEventListener("click", goToCourseSearch);
  if (homeSearch) {
    homeSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") goToCourseSearch();
    });
  }


  // -------------------------
  // Generic Filter + Search helper
  // Works for courses + videos page
  // -------------------------
  function initFilterAndSearch(options) {
    const {
      tabsSelector,
      cardsSelector,
      searchInputId,
      searchBtnId,
      titleSelector,
      gridId,
      validCats
    } = options;

    const tabs = document.querySelectorAll(tabsSelector);
    const cards = document.querySelectorAll(cardsSelector);
    const searchInput = document.getElementById(searchInputId);
    const searchBtn = document.getElementById(searchBtnId);
    const grid = document.getElementById(gridId);

    if (!tabs.length || !cards.length || !searchInput || !searchBtn) return;

    function applyCategoryFilter(filter) {
      cards.forEach(card => {
        const cat = card.dataset.cat;
        card.style.display = (filter === "all" || cat === filter) ? "" : "none";
      });
    }

    function applySearch(q) {
      const query = (q || "").trim().toLowerCase();

      if (!query) {
        const activeTab = document.querySelector(`${tabsSelector}.is-active`);
        const activeFilter = activeTab ? activeTab.dataset.filter : "all";
        applyCategoryFilter(activeFilter);
        return;
      }

      cards.forEach(card => {
        const title = card.querySelector(titleSelector).textContent.toLowerCase();
        card.style.display = title.includes(query) ? "" : "none";
      });

      tabs.forEach(t => t.classList.remove("is-active"));
    }

    // Tab click
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("is-active"));
        tab.classList.add("is-active");

        // clear search because tab controls the grid now
        searchInput.value = "";

        const filter = tab.dataset.filter;
        applyCategoryFilter(filter);

        // scroll to anchor if not all
        if (filter !== "all") {
          const anchor = document.getElementById(filter);
          if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    // Search button
    searchBtn.addEventListener("click", () => applySearch(searchInput.value));

    // Enter key
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applySearch(searchInput.value);
    });

    // Read query string (?q=...)
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      searchInput.value = q;
      applySearch(q);
      if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Hash (#pm etc) auto activate
    const hash = (window.location.hash || "").replace("#", "");
    if (validCats.includes(hash)) {
      tabs.forEach(t => t.classList.remove("is-active"));
      const tabToActivate = document.querySelector(`${tabsSelector}[data-filter="${hash}"]`);
      if (tabToActivate) tabToActivate.classList.add("is-active");
      applyCategoryFilter(hash);

      const anchor = document.getElementById(hash);
      if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }


  // -------------------------
  // Courses Page init
  // (only runs if elements exist)
  // -------------------------
  initFilterAndSearch({
    tabsSelector: ".cp-tab",
    cardsSelector: "#coursesGrid .product-card",
    searchInputId: "courseSearch",
    searchBtnId: "courseSearchBtn",
    titleSelector: ".product-card__title",
    gridId: "coursesGrid",
    validCats: ["pm", "ba", "data", "tech", "cyber", "hse", "eng"]
  });


  // -------------------------
  // Course Videos Page init
  // -------------------------
  initFilterAndSearch({
    tabsSelector: ".cp-tab",
    cardsSelector: "#videosGrid .product-card",
    searchInputId: "videoSearch",
    searchBtnId: "videoSearchBtn",
    titleSelector: ".product-card__title",
    gridId: "videosGrid",
    validCats: ["pm", "ba", "data", "tech", "cyber", "hse", "eng"]
  });


  // -------------------------
  // Testimonials carousel (Home only)
  // -------------------------
  const carousel = document.getElementById("testimonialCarousel");
  const prevBtn = document.getElementById("prevTestimonial");
  const nextBtn = document.getElementById("nextTestimonial");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".testimonial"));
    let index = slides.findIndex(s => s.classList.contains("is-active"));
    if (index < 0) index = 0;

    const show = (i) => {
      slides.forEach(s => s.classList.remove("is-active"));
      slides[i].classList.add("is-active");
      index = i;
    };

    const next = () => show((index + 1) % slides.length);
    const prev = () => show((index - 1 + slides.length) % slides.length);

    if (nextBtn) nextBtn.addEventListener("click", next);
    if (prevBtn) prevBtn.addEventListener("click", prev);

    setInterval(() => {
      if (slides.length > 1) next();
    }, 4500);
  }
// -------------------------
// Continue Watching (Videos Page)
// Saves last watched video
// -------------------------
const videoGrid = document.getElementById("videosGrid");

if (videoGrid) {
  // Mark the "last watched" card on page load
  const lastWatched = localStorage.getItem("ciel_last_watched");
  if (lastWatched) {
    const card = document.querySelector(`.product-card[data-video="${lastWatched}"]`);
    if (card) {
      const ribbon = card.querySelector(".progress-ribbon");
      if (ribbon) ribbon.style.display = "inline-flex";
    }
  }

  // Save when a user clicks Watch
  videoGrid.querySelectorAll('a[data-watch="1"]').forEach(link => {
    link.addEventListener("click", () => {
      const card = link.closest(".product-card");
      if (!card) return;
      const videoId = card.getAttribute("data-video");
      if (!videoId) return;
      localStorage.setItem("ciel_last_watched", videoId);
    });
  });
}
// -------------------------
// Contact Form Validation (contact.html)
// -------------------------
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  const nameEl = document.getElementById("fullName");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const topicEl = document.getElementById("topic");
  const msgEl = document.getElementById("message");
  const successBox = document.getElementById("contactSuccess");

  const errName = document.getElementById("errName");
  const errEmail = document.getElementById("errEmail");
  const errPhone = document.getElementById("errPhone");
  const errTopic = document.getElementById("errTopic");
  const errMsg = document.getElementById("errMsg");

  function setError(input, errEl, message) {
    input.classList.add("is-invalid");
    errEl.textContent = message;
    errEl.style.display = "block";
  }

  function clearError(input, errEl) {
    input.classList.remove("is-invalid");
    errEl.textContent = "";
    errEl.style.display = "none";
  }

  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function digitsOnly(str) {
    return (str || "").replace(/\D/g, "");
  }

  // Live cleanup on typing
  [nameEl, emailEl, phoneEl, msgEl].forEach(el => {
    el.addEventListener("input", () => {
      const map = {
        fullName: errName,
        email: errEmail,
        phone: errPhone,
        message: errMsg
      };
      const err = map[el.id];
      if (err) clearError(el, err);
      if (successBox) successBox.style.display = "none";
    });
  });

  topicEl.addEventListener("change", () => {
    clearError(topicEl, errTopic);
    if (successBox) successBox.style.display = "none";
  });

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault(); // frontend demo

    let ok = true;

    // Name
    if (!nameEl.value.trim() || nameEl.value.trim().length < 3) {
      setError(nameEl, errName, "Please enter your full name (min 3 characters).");
      ok = false;
    } else clearError(nameEl, errName);

    // Email
    if (!emailEl.value.trim() || !isEmailValid(emailEl.value.trim())) {
      setError(emailEl, errEmail, "Please enter a valid email address.");
      ok = false;
    } else clearError(emailEl, errEmail);

    // Phone (digits 10-14)
    const phoneDigits = digitsOnly(phoneEl.value);
    if (!phoneDigits || phoneDigits.length < 10 || phoneDigits.length > 14) {
      setError(phoneEl, errPhone, "Enter a valid phone number (10–14 digits).");
      ok = false;
    } else clearError(phoneEl, errPhone);

    // Topic
    if (!topicEl.value) {
      setError(topicEl, errTopic, "Please select a topic.");
      ok = false;
    } else clearError(topicEl, errTopic);

    // Message
    if (!msgEl.value.trim() || msgEl.value.trim().length < 10) {
      setError(msgEl, errMsg, "Message should be at least 10 characters.");
      ok = false;
    } else clearError(msgEl, errMsg);

    if (!ok) return;

    // Success (demo)
    if (successBox) {
      successBox.style.display = "block";
      successBox.textContent = "✅ Message sent successfully! We will get back to you shortly.";
    }

    contactForm.reset();
  });
}

});
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let ok = true;

  // Name
  if (!nameEl.value.trim() || nameEl.value.trim().length < 3) {
    setError(nameEl, errName, "Please enter your full name (min 3 characters).");
    ok = false;
  } else clearError(nameEl, errName);

  // Email
  if (!emailEl.value.trim() || !isEmailValid(emailEl.value.trim())) {
    setError(emailEl, errEmail, "Please enter a valid email address.");
    ok = false;
  } else clearError(emailEl, errEmail);

  // Phone (digits 10-14)
  const phoneDigits = digitsOnly(phoneEl.value);
  if (!phoneDigits || phoneDigits.length < 10 || phoneDigits.length > 14) {
    setError(phoneEl, errPhone, "Enter a valid phone number (10–14 digits).");
    ok = false;
  } else clearError(phoneEl, errPhone);

  // Topic
  if (!topicEl.value) {
    setError(topicEl, errTopic, "Please select a topic.");
    ok = false;
  } else clearError(topicEl, errTopic);

  // Message
  if (!msgEl.value.trim() || msgEl.value.trim().length < 10) {
    setError(msgEl, errMsg, "Message should be at least 10 characters.");
    ok = false;
  } else clearError(msgEl, errMsg);

  if (!ok) return;

  // Submit to Formspree
  const btn = contactForm.querySelector('button[type="submit"]');
  const oldText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Sending...";

  try {
    const formData = new FormData(contactForm);
    const res = await fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    });

    if (res.ok) {
      successBox.style.display = "block";
      successBox.textContent = "✅ Message sent successfully! We will get back to you shortly.";
      contactForm.reset();
    } else {
      successBox.style.display = "block";
      successBox.textContent = "❌ Message failed. Please try again or email us directly.";
    }
  } catch (err) {
    successBox.style.display = "block";
    successBox.textContent = "❌ Network error. Please check your internet and try again.";
  } finally {
    btn.disabled = false;
    btn.textContent = oldText;
  }
  // -------------------------
// Login Page Validation (login.html)
// -------------------------
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const emailEl = document.getElementById("loginEmail");
  const passEl = document.getElementById("loginPassword");
  const errBox = document.getElementById("loginError");
  const okBox = document.getElementById("loginSuccess");
  const toggle = document.getElementById("togglePassword");

  function isEmailValid(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toggle.addEventListener("click", () => {
    const isPass = passEl.type === "password";
    passEl.type = isPass ? "text" : "password";
    toggle.textContent = isPass ? "Hide" : "Show";
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    errBox.style.display = "none";
    okBox.style.display = "none";

    if (!emailEl.value.trim() || !isEmailValid(emailEl.value.trim())) {
      errBox.textContent = "Please enter a valid email address.";
      errBox.style.display = "block";
      return;
    }

    if (!passEl.value || passEl.value.length < 6) {
      errBox.textContent = "Password must be at least 6 characters.";
      errBox.style.display = "block";
      return;
    }

    // Demo success (replace with backend later)
    okBox.textContent = "✅ Login successful. Redirecting...";
    okBox.style.display = "block";

    setTimeout(() => {
      window.location.href = "course-videos.html";
    }, 1200);
  });
}
// -------------------------
// Register Page Validation (register.html)
// -------------------------
const regForm = document.getElementById("registerForm");

if (regForm) {
  const fullName = document.getElementById("regFullName");
  const email = document.getElementById("regEmail");
  const phone = document.getElementById("regPhone");
  const course = document.getElementById("regCourse");
  const mode = document.getElementById("regMode");
  const pass = document.getElementById("regPassword");
  const pass2 = document.getElementById("regPassword2");
  const terms = document.getElementById("regTerms");

  const eName = document.getElementById("eRegName");
  const eEmail = document.getElementById("eRegEmail");
  const ePhone = document.getElementById("eRegPhone");
  const eCourse = document.getElementById("eRegCourse");
  const eMode = document.getElementById("eRegMode");
  const ePass = document.getElementById("eRegPass");
  const ePass2 = document.getElementById("eRegPass2");
  const eTerms = document.getElementById("eRegTerms");

  const okBox = document.getElementById("regSuccess");

  const toggle1 = document.getElementById("toggleRegPass1");
  const toggle2 = document.getElementById("toggleRegPass2");

  function isEmailValid(val){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }
  function digitsOnly(str){
    return (str || "").replace(/\D/g, "");
  }

  function setError(input, errEl, message){
    input.classList.add("is-invalid");
    errEl.textContent = message;
    errEl.style.display = "block";
  }
  function clearError(input, errEl){
    input.classList.remove("is-invalid");
    errEl.textContent = "";
    errEl.style.display = "none";
  }

  function strongPassword(p){
    // min 8, has upper, lower, number
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(p);
  }

  // Toggle password visibility
  toggle1.addEventListener("click", () => {
    const isPass = pass.type === "password";
    pass.type = isPass ? "text" : "password";
    toggle1.textContent = isPass ? "Hide" : "Show";
  });

  toggle2.addEventListener("click", () => {
    const isPass = pass2.type === "password";
    pass2.type = isPass ? "text" : "password";
    toggle2.textContent = isPass ? "Hide" : "Show";
  });

  // Clear errors while typing
  const watchers = [
    [fullName, eName],
    [email, eEmail],
    [phone, ePhone],
    [course, eCourse],
    [mode, eMode],
    [pass, ePass],
    [pass2, ePass2],
  ];

  watchers.forEach(([input, err]) => {
    input.addEventListener("input", () => {
      clearError(input, err);
      if (okBox) 