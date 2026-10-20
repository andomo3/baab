/* i18n: the site's language, string lookup and the decode transition.

   Strings live in scripts/strings.js, by language and then by key. The markup
   says what is translatable:
     data-i18n="key"                 the element's text (it holds only that text)
     data-i18n-attr="attr:key;..."   attribute values, such as aria-label and alt
   The current language is set on <html lang>, so CSS can use :lang().

   When the language changes, every string on screen decodes from the old text
   to the new one like a departures board (see mix). Strings that are not on
   screen, and every string under reduced motion, swap at once. While a decode
   runs, <html> carries data-decoding, for CSS that should wait for the final
   text.

   A string that wraps to a different number of lines in each language would
   shift the page as it changes. Wrap its live text in a box marked
   data-i18n-reserve="key": hidden copies in every language share the box's
   grid cell and set its height to the tallest, and the live text is laid over
   that cell without adding to it. */
(function () {
  'use strict';

  const LANGS = ['en', 'sw', 'es', 'ru'];
  const STRINGS = window.I18N_STRINGS || { en: {} };
  const TODO = 'TODO';
  const STORE_KEY = 'baab.lang';

  const DURATION = 800; // ms for a full decode
  const REROLL = 55;    // ms between new random glyphs, so the scramble flips rather than buzzes
  const POOL = 'abcdeghkmnoprstuvwyzñжзиклмнпрсуфшыэюя';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = [];
  let current = 'en';
  let chosen = false; // the visitor picked a language, now or on an earlier visit
  let frame = 0;      // the running decode's animation frame, if any

  // A string in a language. A TODO (or a missing string) falls back to English.
  function t(key, lang = current) {
    const value = (STRINGS[lang] || {})[key];
    if (value && value !== TODO) return value;
    const english = STRINGS.en[key];
    return english === undefined ? key : english;
  }

  // The keys a language has not translated yet.
  function missing(lang) {
    return Object.keys(STRINGS.en).filter((key) => {
      const value = (STRINGS[lang] || {})[key];
      return !value || value === TODO;
    });
  }

  // One frame of the decode, as a string. Character j of the longer text
  // settles into its new character at progress th = 0.12 + 0.72 * j / (L - 1).
  // In the 0.3 of progress before that it shows a random glyph (spaces stay
  // spaces), and before that it still shows the old character.
  function mix(from, to, p, glyph) {
    const a = Array.from(from);
    const b = Array.from(to);
    const L = Math.max(a.length, b.length);
    let out = '';
    for (let j = 0; j < L; j++) {
      const th = 0.12 + 0.72 * (L > 1 ? j / (L - 1) : 0);
      const next = b[j] ?? '';
      if (p >= th) {
        out += next;
      } else if (p >= th - 0.3) {
        const ref = next || a[j] || ' ';
        out += ref === ' ' ? ' ' : glyph(j);
      } else {
        out += a[j] ?? '';
      }
    }
    return out;
  }

  const pick = () => POOL[Math.floor(Math.random() * POOL.length)];

  // Runs the decode for a list of { el, from, to } jobs on one animation frame
  // loop. Each job re-rolls its glyphs only when the 55 ms tick changes.
  function decode(jobs) {
    const start = performance.now();
    document.documentElement.setAttribute('data-decoding', '');
    const step = (now) => {
      const p = Math.min(1, Math.max(0, (now - start) / DURATION));
      const tick = Math.floor(now / REROLL);
      for (const job of jobs) {
        if (job.tick !== tick) { job.tick = tick; job.glyphs = []; }
        job.el.textContent = p < 1
          ? mix(job.from, job.to, p, (j) => job.glyphs[j] ?? (job.glyphs[j] = pick()))
          : job.to;
      }
      if (p < 1) {
        frame = requestAnimationFrame(step);
      } else {
        frame = 0;
        document.documentElement.removeAttribute('data-decoding');
      }
    };
    frame = requestAnimationFrame(step);
  }

  function stopDecode() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    document.documentElement.removeAttribute('data-decoding');
  }

  // On screen: rendered at all (not under display: none, as other pages are)
  // and inside the viewport.
  function onScreen(el) {
    if (!el.getClientRects().length) return false;
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  }

  function applyAttributes(root) {
    root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
  }

  // Writes the current language into every translatable string under root, at
  // once. Also for markup built later (the project case studies).
  function apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    applyAttributes(root);
  }

  function swap() {
    const els = [...document.querySelectorAll('[data-i18n]')];
    const visible = els.map(onScreen); // read layout first, then write text
    const jobs = [];
    els.forEach((el, i) => {
      const to = t(el.dataset.i18n);
      const from = el.textContent; // what is showing now, so an interrupted decode carries on from it
      if (to === from) return;
      if (visible[i]) jobs.push({ el, from, to, tick: -1, glyphs: [] });
      else el.textContent = to;
    });
    applyAttributes(document);
    if (jobs.length) decode(jobs);
  }

  function reserve(box) {
    LANGS.forEach((lang) => {
      const copy = document.createElement('span');
      copy.className = 'i18n-copy';
      copy.lang = lang;
      copy.setAttribute('aria-hidden', 'true');
      copy.textContent = t(box.dataset.i18nReserve, lang);
      box.appendChild(copy);
    });
  }

  function readSaved() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      return LANGS.includes(saved) ? saved : null;
    } catch (e) {
      return null;
    }
  }

  function remember(lang) {
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* storage blocked: the choice lasts for this visit only */ }
  }

  // Switches the site to a language. explicit marks a choice the visitor made:
  // it is remembered for the next visit.
  function set(next, { explicit = false } = {}) {
    if (!LANGS.includes(next)) return;
    if (explicit) { chosen = true; remember(next); }
    if (next === current) return;
    const previous = current;
    current = next;
    document.documentElement.lang = next;
    stopDecode();
    if (reducedMotion.matches) apply(); else swap();
    listeners.forEach((fn) => fn(next, previous));
  }

  document.querySelectorAll('[data-i18n-reserve]').forEach(reserve);

  const saved = readSaved();
  if (saved) {
    chosen = true;
    current = saved;
    document.documentElement.lang = saved;
    if (saved !== 'en') apply(); // the markup is English
  }

  window.i18n = {
    languages: LANGS,
    lang: () => current,
    chosen: () => chosen,
    t,
    set,
    apply,
    missing,
    mix,
    onChange: (fn) => { listeners.push(fn); },
  };
})();
