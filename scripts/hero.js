/* Hero behaviour: the language strip, the auto-cycle and where it stops.
   The language itself, and the decode between languages, are scripts/i18n.js.

   Until the visitor chooses, the site steps through the four languages every
   5.2 s. It stops for good on a click in the strip, or as soon as any other
   text on the site comes into view or the hero leaves the screen (scrolling
   down, or opening another page), so body copy elsewhere never changes on a
   timer. A choice is remembered for the next visit, and then nothing cycles.
   Under reduced motion nothing cycles either; the strip still works. */
(function () {
  const CYCLE_MS = 5200;
  const root = document.querySelector('[data-hero]');
  if (!root || !window.i18n) return;

  const languages = i18n.languages;
  const tabs = [...root.querySelectorAll('[data-lang]')];

  // ---- The strip ----
  const mark = (lang) => tabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.lang === lang)));
  mark(i18n.lang());
  i18n.onChange(mark);
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    stopCycle();
    i18n.set(tab.dataset.lang, { explicit: true });
  }));

  // ---- The auto-cycle ----
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let cycling = false;
  let timer = 0;
  let watcher = null;

  function stopCycle() {
    cycling = false;
    clearTimeout(timer);
    if (watcher) watcher.disconnect();
  }

  function tick() {
    if (!cycling) return;
    if (!document.hidden) i18n.set(languages[(languages.indexOf(i18n.lang()) + 1) % languages.length]);
    timer = setTimeout(tick, CYCLE_MS);
  }

  if (!i18n.chosen() && !reduceMotion.matches) {
    cycling = true;
    timer = setTimeout(tick, CYCLE_MS);

    // The language locks as soon as other text, anywhere outside the hero and the
    // nav, comes into view, or once the hero has left the screen altogether.
    watcher = new IntersectionObserver((entries) => {
      if (entries.some((entry) => (entry.target === root ? !entry.isIntersecting : entry.isIntersecting))) stopCycle();
    });
    watcher.observe(root);
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (!el.closest('[data-hero], .top-nav, .mob-nav, .skip-link')) watcher.observe(el);
    });

    reduceMotion.addEventListener('change', (e) => { if (e.matches) stopCycle(); });
  }
})();
