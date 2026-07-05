# Portfolio Improvements — Design Spec

**Date:** 2026-07-04
**Source:** Three parallel audits (UI/CSS/mobile/animations review, accessibility/UX guidelines review, structure/content/dead-code exploration) of the static portfolio site.

## Goal

Fix everything that is *actually broken or unreadable today*, close the accessibility and mobile gaps, remove dead weight, and tighten motion behavior — without changing the site's visual identity, adding dependencies, or restructuring the design system.

## Non-goals (flagged for the owner, not implemented)

- **Image optimization**: `altura.png` (1.35 MB) and `perchance.png` (664 KB) should be re-exported as compressed WebP/JPEG — needs the owner's source files/quality judgment.
- **Asset deletion**: `Perchance.pdf` (708 KB) and `perChance.tex` are unreferenced; owner decides whether they stay in the repo.
- **Keyframe relocation**: 9 keyframes live in `styles.css` instead of `animations.css` (CLAUDE.md drift). Pure churn refactor; deferred.
- **Deep-linkable project state** (`#projects/02`): nice-to-have, deferred.
- **Which email is canonical**: site uses `abbandomo@gmail.com` (mailto) *and* `abba.ndomo@gmail.com` (terminal `contact` command). This spec aligns the terminal to the mailto address; owner must confirm.

## Scope — four workstreams

### 1. Broken-today bug fixes (highest priority)

These are visible defects right now:

- **Terminal text invisible**: `scripts/terminal.js` inline styles use light-palette `var(--fg)` (near-black) inside the dark terminal — track titles, `whoami`, `stack`, fortunes are black-on-black. Replace with `var(--dark-fg)` / `var(--accent)`.
- **Undefined CSS variables**: `--fg-muted` (terminal.js), `--grad` (About-page language bars render with NO fill), `--good` (status greens), `--secondary`, `--p1`/`--p3` (heatmap legend, "Now Playing" subtitle span). Fix by defining the genuinely needed tokens in `:root` (`--good`, `--grad`) and replacing stale references (`--fg-muted` → `--dark-fg-3`, `--p3` → `--accent-dark`, `--p1` → `--accent`).
- **Liner-notes panel unreadable**: dark panel body uses light-palette `--fg`/`--fg-2` text (`enhancements.css:330-355`). Switch to `--dark-fg-*` tokens.
- **Copy errors**: "A library of 7 tracks" → 6 (`index.html:238`); "Top Artists — last.fm" → Spotify (`index.html:302`); terminal contact email → match mailto.
- **`setlist` command prints nothing**: `runCmd` ignores the command's return value — expose the terminal's print function so `setlist` confirms visibly.
- **Terminal cursor never blinks**: inline `animation: blink` has no matching keyframes — reuse the existing blink keyframes from `animations.css`.
- **Stray `play 1` echo before boot intro**: initial programmatic sync prints into the terminal before the intro renders — suppress echo for the initial sync.
- **Duplicate `color` declaration** in `.project-detail h3` (`styles.css:1204,1210`) — keep the intended one.

### 2. Accessibility & SEO

- **Keyboard operability**: top-nav items and logo are `<div>`s; "See all →"/"More about me →"/"⤭ Shuffle" are `<span onclick>`; shelf tiles and IDE file-tree rows are click-only `<div>`s. Convert all to `<button>` (or `<a>` where they navigate to real URLs), with `aria-current` on the active nav item. Preserve exact visual appearance (reset button UA styles).
- **Focus visibility**: no `:focus-visible` rule exists anywhere; terminal input sets `outline: none`. Add a global `:focus-visible` outline using `var(--accent-dark)`.
- **Labels**: `aria-label` on every glyph-only player button (`♡ ⤭ ⏮ ❚❚ ⏭ ↻ 𝅘𝅥𝅮 ≡`), `aria-pressed` sync on like/play toggles, `aria-label="Terminal command"` on the terminal input, `aria-hidden="true"` on decorative inline SVGs.
- **Heading hierarchy**: cards use `<h3>` label followed by `<h2>` name (reversed); `renderFileView` injects a second `<h1>`. Demote project titles to `<h2>`, fix card ordering so headings descend properly.
- **Contrast**: `--fg-4` (#B5A898, ~2.2:1) used as body-adjacent text (About footnote, `.playlist .more`) → switch those usages to `--fg-3`.
- **Images**: add `width`/`height` to `.hero-photo` and shelf `art-preview` imgs (CLS), `loading="lazy"` on tile previews, `fetchpriority="high"` on the headshot.
- **Meta**: absolute `og:image` URL, add `og:url` + canonical link, fix `theme-color` to match light bg.
- **`rel="noopener"`** on all `target="_blank"` links (currently inconsistent).
- **Skip link** to `<main>`.
- **Keyboard shortcut conflict**: Cmd/Ctrl+1-4 is hijacked with `preventDefault()`, overriding browser tab switching — switch to plain digit keys, active only when no input is focused.

### 3. Mobile & iOS correctness

- **`100vh` trap**: `.app` uses `height: 100vh; overflow: hidden` — iOS dynamic URL bar pushes the mob-nav off-screen. Use `100dvh` with `100vh` fallback.
- **Input zoom trap**: terminal input is 13px — iOS auto-zooms a locked-viewport page. Bump to 16px at ≤767px.
- **No working play control on phones**: mini-player's `::after '▶'` pseudo-element has no click handler and uses a light token on the dark bar. Replace with the real (currently hidden) play button, restyled for the mini player, using `--dark-fg` tokens.
- **Touch targets**: `.icon-btn`, `.like` (32px), `.nav-item` (~30px) below 44px — expand hit areas at ≤767px via padding/min-size without changing visual size.
- **mob-nav background**: hardcoded cool-black `rgba(11,11,15,0.96)` mismatches the warm `--dark-bg` player above it — derive from the token.

### 4. Motion safety & performance

- **JS animations ignore reduced motion**: stat counters, cycling eyebrow, tagline/section-sub typewriters, and the terminal boot intro run unconditionally. Gate all with `matchMedia('(prefers-reduced-motion: reduce)')` → render final text immediately.
- **CSS gaps in the reduce block**: six infinite tile-art keyframes + `eq` bars aren't covered — add overrides.
- **Hero layout thrash**: eyebrow typewriter deletes to empty string, collapsing line height every cycle (~17px shift, infinite loop) — reserve height with `min-height`.
- **Hover lag**: reveal stagger sets inline `transitionDelay` on cards/tiles that then delays hover transitions forever — clear it once `.visible` lands.
- **Idle rAF loop**: `tickEQ` writes CSS custom properties every frame forever — stop when energy decays to 0, restart on scroll, skip under reduced motion.
- **Hidden heatmap still fetches**: `display:none` section triggers `data/github-commits.json` fetch and render — guard the fetch on section visibility.
- **No-op clock interval**: `#clock` doesn't exist but a `setInterval` fires every second — remove.
- **Section-sub typewriter destroys markup**: it flattens `textContent`, permanently stripping the styled `help` span in the "Now Playing" subtitle — restore original HTML on completion (or skip subs containing elements).

### 5. Dead code removal

All confirmed unreachable by the exploration audit:

- `index.html`: hidden sidebar block (lines 50-79, `display:none!important`).
- `enhancements.js`: commented-out visualizer block (~lines 184-572) and its stub.
- `enhancements.css`: `.viz-*` ruleset (~lines 20-282) incl. dead `vizFade`/`vizPulse`/`lidarSweep` keyframes.
- `styles.css`: `.playlist` component (~667-762) + its `mobile.css` overrides; orphaned `.ide-tabs`/`.ide-tab`, `.player-left .cover`/`.cover-icon-np`, `.distribution`; the trailing duplicate `@media (max-width: 980px)` block (1602-1618) that contradicts `mobile.css`.
- `app.js`: dead wiring for `#clock`, `#scroll-progress`, `#screen-label` fallbacks kept where guarded, `#distribution` generator, `.cover-icon-np` swap, `[data-history]`; unused `ICONS['07']`.
- `mobile.css`: duplicate `.top-nav` rule in the ≤767px block, `.playlist` overrides.

The hidden heatmap **section stays** in `index.html` (it's a feature the owner may re-enable) — only its wasted fetch is guarded (workstream 4).

## Approaches considered

1. **Fix-everything single pass** — one agent edits all files at once. Rejected: too much surface area for one diff to stay reviewable and correct.
2. **Three sequential batches by workstream (chosen)** — (a) bug fixes + tokens, (b) accessibility/SEO, (c) mobile + motion + dead-code removal. Each batch touches the same files but with a narrow lens; sequential execution avoids edit conflicts and lets the reviewer audit incrementally.
3. **Minimal bugs-only pass** — fix only workstream 1. Rejected: the user asked for a full analyze→improve cycle; a11y and mobile findings are high-severity.

## Constraints

- No new dependencies, no build tooling (CLAUDE.md).
- All colors/spacing via design tokens; dark islands stay dark, light stays light.
- Every new animation behavior gets a `prefers-reduced-motion` path.
- **No `git add`/`git commit`/`git push`** — local edits only; owner reviews and stages.
- Visual identity unchanged: same layout, palette, typography, interactions — this is a correctness/quality pass, not a redesign.

## Success criteria

- Terminal output, liner notes, and About-page language bars are readable/rendered.
- Site is fully keyboard-navigable with visible focus; interactive controls have accessible names.
- No layout shift from the eyebrow cycle; reduced-motion users get static content everywhere.
- iOS: mob-nav fully visible, no zoom-on-focus, working play control on phones.
- ~700+ lines of confirmed-dead code removed with zero visual change.
- Site renders identically (minus fixes) when opened locally in a browser.
