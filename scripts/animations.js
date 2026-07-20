(function () {

  // Shared reduced-motion flag — every JS-driven animation checks this.
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Loading screen ----------
  const loader = document.getElementById('loader');
  const heroDark = document.querySelector('.hero-v3');

  function triggerHero() {
    if (heroDark) heroDark.classList.add('hero-loaded');
    startStatCounters();
    setTimeout(typeTagline, 250);
  }

  if (loader) {
    setTimeout(() => {
      loader.classList.add('exit');
      setTimeout(() => {
        loader.remove();
        triggerHero();
      }, 450);
    }, 1400);
  } else {
    requestAnimationFrame(triggerHero);
  }

  // ---------- Stat counters ----------
  function startStatCounters() {
    if (REDUCED_MOTION) return; // markup already holds the final numbers
    document.querySelectorAll('.hstat-n').forEach(el => {
      const raw = el.textContent.trim();
      const num = parseInt(raw.replace(/\D/g, ''), 10);
      if (isNaN(num)) return;
      const suffix = raw.replace(/[\d]/g, '');
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * num) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  // ---------- Typewriter core ----------
  function typewriter(el, text, speed, onDone) {
    // Reserve the element's current height so clearing text doesn't collapse layout
    const h = el.offsetHeight;
    if (h > 0) el.style.minHeight = h + 'px';

    el.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'tw-cursor';
    el.appendChild(cursor);
    let i = 0;
    function tick() {
      if (i < text.length) {
        cursor.insertAdjacentText('beforebegin', text[i]);
        i++;
        setTimeout(tick, speed + Math.random() * 18);
      } else {
        el.style.minHeight = '';
        if (onDone) onDone(cursor);
      }
    }
    tick();
  }

  // ---------- Hero tagline typewriter ----------
  function typeTagline() {
    const el = document.querySelector('.hero-bio');
    if (!el) return;
    if (REDUCED_MOTION) return; // full text is already in the markup
    const text = el.textContent.trim();
    typewriter(el, text, 14, (cursor) => {
      setTimeout(() => cursor.classList.add('tw-cursor-done'), 1200);
    });
  }

  // ---------- Scroll reveal ----------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('visible');
        // Clear the inline stagger delay so later state changes aren't lagged
        el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });

  // Section sub typewriter on scroll
  const subObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      subObserver.unobserve(el);
      const text = el.dataset.twText;
      if (!text) return;
      typewriter(el, text, 26, (cursor) => {
        setTimeout(() => cursor.classList.add('tw-cursor-done'), 700);
      });
    });
  }, { threshold: 0.8 });

  function observeRevealTargets() {
    document.querySelectorAll(
      // The hero terminal is excluded — the load stagger already reveals it.
      '.section-head, .role-row, .rule-head, .card, .star-item, .np-widget:not(.hero-terminal-row .np-widget)'
    ).forEach((el, i) => {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 5) * 55 + 'ms';
      revealObserver.observe(el);
    });

    // Skip under reduced motion, and skip subs with child elements —
    // typewriting flattens textContent and would destroy styled spans.
    if (!REDUCED_MOTION) {
      document.querySelectorAll('.section-head .sub').forEach(el => {
        if (el.dataset.twText || el.children.length > 0) return;
        el.dataset.twText = el.textContent.trim();
        el.textContent = '';
        subObserver.observe(el);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { observeRevealTargets(); initParallax(); });
  } else {
    observeRevealTargets();
    initParallax();
  }

  window.addEventListener('navigate', () => setTimeout(observeRevealTargets, 80));

  // ---------- Parallax ----------
  function initParallax() {
    // removed
  }

})();
