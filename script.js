(function () {
  "use strict";

  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const yearEl = document.querySelector("[data-year]");
  const form = document.querySelector("[data-contact-form]");
  const revealEls = document.querySelectorAll("[data-reveal]");

  /* Current year in footer */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Sticky header shadow on scroll */
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile navigation */
  function setNavOpen(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    const label = navToggle.querySelector(".visually-hidden");
    if (label) {
      label.textContent = open ? "메뉴 닫기" : "메뉴 열기";
    }
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const open = !nav.classList.contains("is-open");
      setNavOpen(open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 769px)").matches) {
        setNavOpen(false);
      }
    });
  }

  /* Smooth in-page navigation (native smooth scroll + polyfill behavior) */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (history.replaceState) {
        history.replaceState(null, "", id);
      }
    });
  });

  /* Scroll reveal */
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Contact form — client-side validation + demo submit */
  const messages = {
    nameRequired: "이름을 입력해 주세요.",
    nameShort: "이름은 2자 이상이어야 합니다.",
    emailRequired: "이메일을 입력해 주세요.",
    emailInvalid: "올바른 이메일 형식이 아닙니다.",
    messageRequired: "메시지를 입력해 주세요.",
    messageShort: "메시지는 10자 이상으로 작성해 주세요.",
    success: "전송되었습니다. 곧 연락드리겠습니다.",
  };

  function showFieldError(name, text) {
    const err = document.querySelector('[data-error-for="' + name + '"]');
    if (!err) return;
    err.textContent = text;
    err.hidden = false;
  }

  function clearFieldErrors() {
    document.querySelectorAll(".field-error").forEach(function (p) {
      p.textContent = "";
      p.hidden = true;
    });
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    const status = form.querySelector("[data-form-status]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFieldErrors();
      if (status) {
        status.textContent = "";
        status.classList.remove("is-error");
      }

      const name = form.elements.namedItem("name");
      const email = form.elements.namedItem("email");
      const message = form.elements.namedItem("message");

      let ok = true;

      if (!name || !name.value.trim()) {
        showFieldError("name", messages.nameRequired);
        ok = false;
      } else if (name.value.trim().length < 2) {
        showFieldError("name", messages.nameShort);
        ok = false;
      }

      if (!email || !email.value.trim()) {
        showFieldError("email", messages.emailRequired);
        ok = false;
      } else if (!validateEmail(email.value.trim())) {
        showFieldError("email", messages.emailInvalid);
        ok = false;
      }

      if (!message || !message.value.trim()) {
        showFieldError("message", messages.messageRequired);
        ok = false;
      } else if (message.value.trim().length < 10) {
        showFieldError("message", messages.messageShort);
        ok = false;
      }

      if (!ok) {
        if (status) {
          status.textContent = "입력 내용을 확인해 주세요.";
          status.classList.add("is-error");
        }
        return;
      }

      /* 데모: 실제 서버 연동 시 fetch로 교체 */
      if (status) {
        status.textContent = messages.success;
        status.classList.remove("is-error");
      }
      form.reset();
    });
  }
})();
