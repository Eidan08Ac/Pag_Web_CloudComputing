/* ================================================================
   NexCloud – app.js
   Features:
     1. Navbar: scroll shadow + hamburger menu
     2. Reveal animations (IntersectionObserver fallback)
     3. Animated stat counters
     4. FAQ accordion
     5. Contact form validation
     6. Back-to-top button
================================================================ */

'use strict';

/* ───────────────────────────────────────────────
   1. NAVBAR
─────────────────────────────────────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const menu      = document.getElementById('navMenu');
  const links     = menu.querySelectorAll('.navbar__link');

  // Add scrolled class for glassmorphism effect
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    // Show/hide back-to-top
    const btn = document.getElementById('backToTop');
    if (window.scrollY > 400) {
      btn.hidden = false;
      setTimeout(() => (btn.style.opacity = '1'), 10);
    } else {
      btn.style.opacity = '0';
      setTimeout(() => (btn.hidden = true), 300);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Hamburger toggle
  const openMenu = () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  };
  toggle.addEventListener('click', openMenu);

  // Close menu on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !navbar.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();


/* ───────────────────────────────────────────────
   2. REVEAL ANIMATIONS (IntersectionObserver fallback)
   Only activate when native scroll-driven animations
   are NOT supported (progressive enhancement).
─────────────────────────────────────────────── */
(function initReveal() {
  // If browser supports scroll-driven animations, CSS handles it
  const hasScrollDriven =
    CSS.supports('(animation-timeline: view()) and (animation-range: entry)');

  if (hasScrollDriven) return; // CSS takes over

  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach(el => observer.observe(el));
})();


/* ───────────────────────────────────────────────
   3. ANIMATED COUNTERS
─────────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-card__number[data-target]');
  if (!counters.length) return;

  let started = false;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800; // ms
    const start    = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);

      el.textContent = value.toLocaleString('es-MX');

      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const statsSection = document.getElementById('stats');
  if (!statsSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        counters.forEach(animateCounter);
        observer.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  observer.observe(statsSection);
})();


/* ───────────────────────────────────────────────
   4. FAQ ACCORDION
─────────────────────────────────────────────── */
(function initFAQ() {
  const questions = document.querySelectorAll('.faq__question');
  if (!questions.length) return;

  questions.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen  = btn.getAttribute('aria-expanded') === 'true';
      const answer  = btn.nextElementSibling;

      // Close all others
      questions.forEach(q => {
        q.setAttribute('aria-expanded', 'false');
        q.nextElementSibling.hidden = true;
      });

      // Toggle current
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        // Animate open
        answer.style.overflow = 'hidden';
        answer.style.height = '0';
        requestAnimationFrame(() => {
          answer.style.transition = 'height .3s ease';
          answer.style.height = answer.scrollHeight + 'px';
          answer.addEventListener('transitionend', () => {
            answer.style.height = '';
            answer.style.overflow = '';
          }, { once: true });
        });
      }
    });
  });
})();


/* ───────────────────────────────────────────────
   5. CONTACT FORM VALIDATION
─────────────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  const showError = (input, msg) => {
    input.classList.add('invalid');
    const err = input.parentElement.querySelector('.form-error');
    if (err) err.textContent = msg;
  };

  const clearError = (input) => {
    input.classList.remove('invalid');
    const err = input.parentElement.querySelector('.form-error');
    if (err) err.textContent = '';
  };

  const validateField = (input) => {
    clearError(input);
    const val = input.value.trim();

    if (input.required && !val) {
      showError(input, 'Este campo es obligatorio.');
      return false;
    }
    if (input.type === 'email') {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(val)) {
        showError(input, 'Ingresa un correo electronico valido.');
        return false;
      }
    }
    if (input.minLength && val.length < input.minLength) {
      showError(input, 'Minimo ' + input.minLength + ' caracteres.');
      return false;
    }
    return true;
  };

  // Live validation on blur
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) validateField(field);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('input, select, textarea').forEach(field => {
      if (!validateField(field)) valid = false;
    });

    if (!valid) return;

    // Simulate async submission
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    setTimeout(() => {
      form.reset();
      form.querySelectorAll('input, select, textarea').forEach(clearError);
      btn.disabled = false;
      btn.textContent = 'Enviar mensaje';
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => (success.hidden = true), 5000);
    }, 1200);
  });
})();


/* ───────────────────────────────────────────────
   6. BACK TO TOP
─────────────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
