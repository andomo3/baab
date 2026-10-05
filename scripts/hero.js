/* Polyglot hero: the italic line under the name fades between languages.
   It rotates every 4.5 s until the visitor picks a language in the strip,
   then stays on that one for the rest of the visit. With reduced motion
   nothing rotates; the strip still works. */
(function () {
  const ROTATE_MS = 4500;
  const root = document.querySelector('[data-hero]');
  if (!root) return;
  const lines = [...root.querySelectorAll('[data-line]')];
  const tabs = [...root.querySelectorAll('[data-lang]')];
  let current = 0;
  let paused = false; // set once the visitor picks a language

  const show = (k) => {
    current = k;
    lines.forEach((el, n) => el.classList.toggle('is-on', n === k));
    tabs.forEach((el, n) => el.setAttribute('aria-pressed', String(n === k)));
  };

  tabs.forEach((el, n) => el.addEventListener('click', () => {
    paused = true;
    show(n);
  }));

  show(0);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    setInterval(() => {
      if (!paused) show((current + 1) % lines.length);
    }, ROTATE_MS);
  }
})();
