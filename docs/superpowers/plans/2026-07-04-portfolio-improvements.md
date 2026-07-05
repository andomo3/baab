# Portfolio Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all currently-broken rendering, close accessibility/mobile/motion gaps, and remove confirmed-dead code in the static portfolio site — with zero visual redesign.

**Architecture:** Pure static site (one `index.html`, 4 CSS files, 4 JS files, no build step). Three sequential batches: (1) broken-today bug fixes + missing tokens, (2) accessibility & SEO, (3) mobile/iOS + motion safety + dead-code removal. Batches touch the same files, so they must run sequentially, each verified before the next.

**Tech Stack:** Vanilla HTML/CSS/JS. No dependencies may be added.

**Spec:** `docs/superpowers/specs/2026-07-04-portfolio-improvements-design.md`

## Global Constraints

- **NEVER run `git add`, `git commit`, or `git push`** — the owner stages and commits everything manually. There are NO commit steps in this plan.
- No new dependencies, no build tooling, no framework (CLAUDE.md).
- All colors/spacing/radii via CSS custom properties from `stylesheets/styles.css` `:root` — never hardcode.
- Dark islands (hero, player bar, terminal, liner-notes panel) use `--dark-*` tokens; everything else uses the light palette. Never mix within a component.
- Every animation must have a `prefers-reduced-motion` path.
- New keyframes go in `stylesheets/animations.css`; phone overrides go in `stylesheets/mobile.css`.
- Canonical site URL: `https://andomo3.github.io/baab/`.
- Verification is manual/grep-based — this project has no test runner. Each task ends with a concrete verification step.

---

## Batch 1 — Broken-today bug fixes

### Task 1: Define missing tokens and fix undefined CSS variable references

**Files:**
- Modify: `stylesheets/styles.css` (`:root` block, lines ~6-58; `.project-detail h3` ~1204-1210)
- Modify: `index.html` (heatmap legend ~219-223; "Now Playing" subtitle ~130)
- Modify: `scripts/terminal.js` (lines ~67-68, 197, 199)

**Interfaces:**
- Produces: `--good` and `--grad` tokens in `:root`, relied on by existing rules (`styles.css:722,854,873,1344,1357`) and later tasks.

- [x] **Step 1: Add missing tokens to `:root` in `styles.css`** (after the existing accent tokens):

```css
  --good: #4CAF50;
  --grad: linear-gradient(90deg, var(--accent), var(--accent-dark));
```

- [x] **Step 2: Replace undefined `--p1`/`--p3` references in `index.html`.** In the heatmap legend (~lines 219-223) replace `var(--p1)` → `var(--accent)` and `var(--p3)` → `var(--accent-dark)`. In the "Now Playing" subtitle (~line 130) replace `var(--p3)` → `var(--accent-dark)`.

- [x] **Step 3: Replace undefined `--fg-muted` in `terminal.js`** (lines ~67-68, 197, 199): `var(--fg-muted)` → `var(--dark-fg-3)`.

- [x] **Step 4: Fix duplicate `color` declaration in `.project-detail h3`** (`styles.css` ~1204-1210): the rule declares `color: var(--fg)` then `color: var(--fg-3)`; delete the first (`var(--fg)`) line, keep `var(--fg-3)`.

- [x] **Step 5: Verify.** Run: `grep -rn "var(--p1)\|var(--p3)\|var(--fg-muted)" index.html scripts stylesheets` → expect **no matches**. Run `grep -n "\-\-good:\|--grad:" stylesheets/styles.css` → expect both tokens defined once in `:root`. *(Result: `--fg-muted` fully cleared; `--good`/`--grad` defined once at styles.css:20-21. NOTE: `--p1`/`--p2`/`--p3` turned out to be DEFINED aliases in `:root` (styles.css:34-38), not undefined — the listed index.html/terminal.js spots were converted, but alias-backed uses elsewhere (styles.css heatmap cells/playlist, enhancements.css viz, enhancements.js viz SVGs, app.js artist tiles) were left as-is; most are deleted in Task 9.)*

### Task 2: Fix terminal readability and behavior (`terminal.js`)

**Files:**
- Modify: `scripts/terminal.js` (inline colors at ~79, 83, 155, 161, 187, 198, 222, 226, 237; cursor ~112; email ~244; runCmd ~258; intro ~128)
- Modify: `scripts/enhancements.js` (setlist command ~637-657)
- Modify: `scripts/app.js` (initial `openTab('01')` sync ~324)

**Interfaces:**
- Produces: `window.__term.print(html, cls)` — appends one output line to the terminal body. Consumed by the `setlist` command in `enhancements.js`.

- [x] **Step 1: Fix dark-island colors in terminal output.** In `terminal.js`, in the inline-styled HTML strings (track lines, `whoami`, `stack`, fortunes — lines ~79, 83, 155, 161, 187, 198, 222, 226, 237): replace `var(--fg)` → `var(--dark-fg)` and `var(--p3)` → `var(--accent)`. (Inside the dark terminal, `--accent` #C49A6C is the readable accent; do NOT use `--accent-dark` here.)

- [x] **Step 2: Fix the intro cursor blink** (~line 112): the inline style references `animation: blink ...` but no `blink` keyframes exist. Check `stylesheets/animations.css` for the existing blink keyframes name (e.g. `tw-blink` or `cursor-blink`) and use that name in the inline animation. If none exists, add to `animations.css`:

```css
@keyframes term-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
```

and reference `term-blink`. Add `animation: none` for it inside the existing `prefers-reduced-motion` block if it isn't covered by a blanket rule.

- [x] **Step 3: Align the contact email** (~line 244): change `abba.ndomo@gmail.com` → `abbandomo@gmail.com` (matches the `mailto:` in `index.html:331`).

- [x] **Step 4: Expose a print function.** Where `window.__term` is assigned (`terminal.js` ~end), add a `print(html, cls)` method that appends a line to `#term-body` using the same line-rendering helper `runCmd` uses, and scrolls to bottom.

- [x] **Step 5: Make `setlist` print its result.** In `enhancements.js` (~637-657) the command returns `{ line, cls }` which `runCmd` ignores. Change the command to call `window.__term.print(line, cls)` directly (keep the reorder side-effect).

- [x] **Step 6: Suppress the stray initial echo.** `app.js:324` calls `runCmd('play 1')` on load, printing a command block before the boot intro renders. Add an options parameter to `runCmd(cmd, { echo = true } = {})` that skips printing the `abba@portfolio:~$ play 1` prompt-echo line (still executes the command silently — also suppress its output lines for the initial sync: use `{ echo: false, silent: true }` and guard output appends on `silent`). Update the `app.js:324` call site to pass the flag; every other call site keeps default behavior.

- [x] **Step 7: Verify.** Run: `grep -n "var(--fg)" scripts/terminal.js` → no matches. `grep -n "abba.ndomo" scripts/terminal.js` → no matches. Open `index.html` in a browser (`start index.html`): terminal boot intro renders with no stray `play 1` block above it; type `now` and `stack` — output is readable (light text on dark); type `setlist quant` — a confirmation line prints. *(Greps confirmed: no `var(--fg)`, no `var(--p1)`/`var(--p3)`, no literal `abba.ndomo@gmail.com` in terminal.js. Blink keyframe reuses existing `cursor-blink`; cursor got a `.term-cursor` class covered in the reduce-motion block. `openTab()` gained an opts param so only the initial load call runs `play 1` with `{echo:false, silent:true}`. Browser check deferred to reviewer.)*

### Task 3: Fix liner-notes panel colors and copy errors

**Files:**
- Modify: `stylesheets/enhancements.css` (liner panel text ~330-355)
- Modify: `index.html` (~238, ~302, ~304)

- [x] **Step 1: Liner-notes panel dark tokens** (`enhancements.css` ~330-355): the panel background is dark; replace text colors `var(--fg)` → `var(--dark-fg)`, `var(--fg-2)` → `var(--dark-fg-2)`, `var(--fg-3)` → `var(--dark-fg-3)`, `var(--fg-4)` → `var(--dark-fg-4)` — for `.liner-head .title`, `.liner-body`, and any sibling text rules inside the panel (check the whole `.liner-*` block, ~294-380).

- [x] **Step 2: Copy fixes in `index.html`:** line ~238 "A library of 7 tracks" → "A library of 6 tracks"; line ~302 "Top Artists — last.fm, all time" → "Top Artists — Spotify, all time"; line ~304 footnote already says "via Spotify" — keep.

- [x] **Step 3: Verify.** `grep -n "7 tracks\|last.fm" index.html` → no matches. In the browser, click the player's Lyrics (𝅘𝅥𝅮) button: liner-notes panel text is light-on-dark and readable. *(Grep confirmed: no matches. All `.liner-*` text rules now use `--dark-fg-*`; `.liner-body em` moved `var(--p3)` → `var(--accent)` per the dark-island accent rule. Browser check deferred to reviewer.)*

---

## Batch 2 — Accessibility & SEO

### Task 4: Semantic HTML, ARIA, and meta in `index.html`

**Files:**
- Modify: `index.html`

**Interfaces:**
- Produces: nav items become `<button class="nav-item" data-nav="...">`; `.more` becomes `<button class="more" data-nav="...">` or with `data-cmd="shuffle"`. Task 6 wires `data-cmd`; existing `app.js` delegation on `[data-nav]` keeps working (it binds by attribute, not tag).

- [x] **Step 1: Skip link.** Immediately after `<body>` add:

```html
<a class="skip-link" href="#main">Skip to content</a>
```

and add `id="main"` + `tabindex="-1"` to `<main class="main">`.

- [x] **Step 2: Top nav → buttons** (~39-47): change `<div class="nav-logo" data-nav="home">` and each `<div class="nav-item" data-nav="...">` to `<button type="button" ...>` with the same classes/attributes. Add `aria-current="page"` to the active one. Wrap-level `<nav class="nav-links">` already exists — keep.

- [x] **Step 3: `.more` spans → buttons** (~120, 157, 240): replace each `<span class="more" onclick="...">` with `<button type="button" class="more" data-nav="projects">See all →</button>` (line 120), `<button type="button" class="more" data-nav="about">More about me →</button>` (line 157), `<button type="button" class="more" data-cmd="shuffle">⤭ Shuffle</button>` (line 240). Remove the inline `onclick` attributes.

- [x] **Step 4: Player bar labels** (~359-385): add `aria-label` to each glyph button — Like ("Like this track"), Shuffle, Previous, Play/Pause (`aria-label="Pause"` initially since it shows ❚❚), Next, Repeat, Lyrics ("Open liner notes"), Queue ("Open projects"). Add `aria-pressed="false"` to Like and Repeat. Replace the play button's inline `onclick` glyph-swap with `data-toggle="play"` (Task 6 wires it and syncs `aria-label`). Replace the two `window.__term && window.__term.runCmd(...)` inline onclicks with `data-cmd="shuffle"` / `data-cmd="prev"` / `data-cmd="next"` attributes. *(Existing `title` attributes kept — `enhancements.js:152` selects the Lyrics button via `[title="Lyrics"]`.)*

- [x] **Step 5: Terminal input label** (~142): add `aria-label="Terminal command"`.

- [x] **Step 6: Heading order in cards.** About/Contact cards (~272-348) use `<h3>Label</h3>` followed by `<h2>Name</h2>`. Swap roles: the card label (`<h3>Identity</h3>` etc.) becomes a `<div class="card-label">`, and keep the name as the heading (change `<h2>Abba Ndomo</h2>` → `<h3>Abba Ndomo</h3>`; same for "Let's work together."). Add to `styles.css` a `.card-label` rule that copies the current `.card h3` label styling, and adjust `.card h3` usage accordingly — visual appearance must not change. Apply to all six cards (Identity, Stack, Facts, Top Artists, Get in touch, Availability). *(CSS: old `.card h3` label rule renamed to `.card .card-label`; old `.card h2` title rule extended to `.card h2, .card h3` so the two new h3 titles render pixel-identical. No `<h2>` remains inside cards.)*

- [x] **Step 7: Decorative SVGs**: add `aria-hidden="true"` to inline SVGs inside mob-nav buttons (~388-405) and the contact GitHub icon (~333). (Sidebar SVGs disappear in Task 9.)

- [x] **Step 8: `rel="noopener"`** on every `target="_blank"` link missing it (~70, 101, 102, 334). *(Six links patched: hero Resume + LinkedIn, contact Resume, and the three hidden-sidebar links (Resume/GitHub/LinkedIn) — the sidebar goes away in Task 9 but "every link" was taken literally.)*

- [x] **Step 9: Images**: on `.hero-photo` (~106) add `width="1000" height="1000"` — first run `magick identify headshot.jpeg 2>/dev/null || python -c "from PIL import Image; print(Image.open('headshot.jpeg').size)"` to get real dimensions and use those; add `fetchpriority="high"`. (Shelf preview imgs are built in JS — Task 6.) *(Real dimensions via System.Drawing: 1200×1600 — used `width="1200" height="1600"`.)*

- [x] **Step 10: Meta** (head): `og:image` → `https://andomo3.github.io/baab/headshot.jpeg`; add `<meta property="og:url" content="https://andomo3.github.io/baab/" />` and `<link rel="canonical" href="https://andomo3.github.io/baab/" />`; change `theme-color` `#1a1a1a` → `#FAF8F4`.

- [x] **Step 11: Verify.** `grep -n "onclick=" index.html` → no matches. `grep -c "aria-label" index.html` → ≥ 9. `grep -n "og:url\|canonical" index.html` → both present. Tab through the page in the browser: nav, more-buttons, player controls all reachable. *(Greps confirmed: 0 onclick, aria-label count = 9, og:url + canonical present. Hero h1 is the only `<h1>` left. Browser tab-through deferred to reviewer.)*

### Task 5: Focus visibility, button resets, contrast (`styles.css`)

**Files:**
- Modify: `stylesheets/styles.css`

**Interfaces:**
- Consumes: `<button>`-based `.nav-item`, `.nav-logo`, `.more`, `.card-label` from Task 4.

- [x] **Step 1: Button reset.** `.nav-item`, `.nav-logo`, and `.more` are now `<button>`s; add (near their existing rules):

```css
button.nav-item, button.nav-logo, button.more {
  background: none; border: 0; font: inherit; color: inherit;
  cursor: pointer; text-align: inherit; padding: 0;
}
```

Then check each rule's existing padding — `.nav-item` has its own padding in its rule (~144-153); ensure the reset doesn't strip needed padding (if `.nav-item` already sets padding, the reset's `padding: 0` is overridden by the later/more-specific existing rule — verify visually). *(Deviation: the plan's `button.X` selectors are (0,1,1) and would BEAT the later (0,1,0) component rules — clobbering `.nav-item`'s `padding: 6px 12px` and the `.nav-logo`/`.nav-item` font declarations via `font: inherit`. Implemented as class-only selectors `.nav-item, .nav-logo, .more { ... }` placed BEFORE the component rules (styles.css ~131-136), so every existing font/padding/color declaration still wins by source order. Pixel-identical.)*

- [x] **Step 2: Global focus visibility.** Add near the top of `styles.css` (after resets):

```css
:focus-visible { outline: 2px solid var(--accent-dark); outline-offset: 2px; border-radius: 2px; }
.np-widget-input input:focus-visible { outline: none; }
.skip-link { position: absolute; left: -9999px; top: 0; z-index: 200; background: var(--dark-bg); color: var(--dark-fg); padding: 10px 16px; border-radius: var(--r-md, 8px); font: 600 13px var(--sans); }
.skip-link:focus-visible { left: 12px; top: 12px; }
```

(The terminal input keeps its no-outline look because the whole widget is the focus context; its parent `.np-widget-input` gets `:focus-within { border-color: var(--accent); }` — add that too.)

- [x] **Step 3: Contrast swaps.** Change text usages of `var(--fg-4)` to `var(--fg-3)` where it's body-adjacent text: the About footnote is inline in `index.html` (~304, `color: var(--fg-4)` → `var(--fg-3)`). Leave `--fg-4` for decorative/disabled uses.

- [x] **Step 4: `aria-current` styling parity**: `.nav-item[aria-current="page"]` should match `.nav-item.active` — extend the existing `.nav-item.active` selector to `.nav-item.active, .nav-item[aria-current="page"]`. *(Also extended the hover-underline selector `.nav-item.active::after` in `animations.css:114` for full parity.)*

- [x] **Step 5: Verify.** In the browser, Tab from the address bar: skip link appears first; every interactive control shows a visible outline; nav looks pixel-identical to before (compare active/inactive states). *(Browser check deferred to reviewer; grep confirms `:focus-visible`/`:focus-within`/`.skip-link` rules present in styles.css:90-94.)*

### Task 6: Keyboard-operable shelf, file tree, and player sync (`app.js`)

**Files:**
- Modify: `scripts/app.js` (shelf ~208-222, file tree ~230-237, renderFileView ~266, shortcuts ~190-195, nav active sync, player)

**Interfaces:**
- Consumes: `data-cmd` attributes from Task 4; `window.__term.runCmd`.
- Produces: shelf tiles and tree rows rendered as `<button type="button">`.

- [x] **Step 1: `data-cmd` delegation.** Add one delegated listener (next to the existing `[data-nav]` delegation):

```js
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-cmd]');
  if (el && window.__term) window.__term.runCmd(el.dataset.cmd);
});
```

- [x] **Step 2: Play toggle.** Replace the removed inline onclick: wire `#np-play` (`[data-toggle="play"]`) in JS — toggle the ❚❚/▶ glyph AND `aria-label` ("Pause"/"Play") together. Sync `aria-pressed` on Like (`#np-like`) and Repeat (`[data-toggle="repeat"]`) toggles where their handlers already live. *(Glyph/aria-label wired into the existing `#np-play` `isPlaying` listener; the generic `[data-toggle]` cosmetic handler now syncs `aria-pressed` on any toggle that declares the attribute (Repeat); `refreshLike()` syncs Like's `aria-pressed`. The generic handler also toggles a `.active` class on `#np-play` — `.play-main.active` is unstyled, so no visual effect.)*

- [x] **Step 3: Shelf tiles → buttons** (~208-222): render each tile as `<button type="button" class="tile" ...>` instead of `<div>`. Preview `<img>` gets `loading="lazy"` and `width`/`height` attributes matching its rendered box (check `.art-preview` CSS for the aspect; use the CSS box dimensions). Add `button.tile { font: inherit; text-align: left; background: ...existing...; }` reset to `styles.css` if the tile styling doesn't already cover button UA styles (test visually). *(Img gets `width="220" height="220"` — `.art` is `aspect-ratio: 1` in a `minmax(220px, 1fr)` grid track. Reset declarations (display/width/padding/margin/background/border/font/color/text-align) merged into the existing `.tile` base rule rather than a separate `button.tile` rule — buttons shrink-wrap by default, so `display: block; width: 100%` is required to match the old div geometry.)*

- [x] **Step 4: File tree rows → buttons** (~230-237): render rows as `<button type="button" class="ide-file" ...>`; add `aria-current="true"` on the open file, removed from siblings on switch. Button reset in CSS as needed. *(Plan's `ide-file` class doesn't exist — actual class is `ide-item` (styles.css + `openTab()` both key on it); kept `ide-item`. Reset merged into the `.ide-item` base rule with `width: calc(100% - 12px)` to account for its `margin-right: 12px` — plain `width: 100%` would overflow 12px versus the old div, since buttons don't auto-fill. Added `line-height: inherit; letter-spacing: inherit` to neutralize button UA typography.)*

- [x] **Step 5: Demote injected `<h1>`** in `renderFileView` (~266): `<h1>` → `<h2>` (hero keeps the only h1). Check `styles.css` for `.project-detail h1` styling and rename the selector to match. *(Renamed in both styles.css:1163 and mobile.css:223.)*

- [x] **Step 6: Fix shortcut hijack** (~190-195): currently Cmd/Ctrl+1-4 with `preventDefault()`. Change to plain digit keys `1-4` with NO modifier, active only when `document.activeElement` is not an input/textarea; remove `preventDefault` on browser-reserved combos entirely. *(Also removed the Cmd/Ctrl+K terminal-focus binding that lived in the same block — Ctrl+K is browser-reserved (address-bar search) and the plan's grep expects no modifier hijack. The "⌘K" badge in the terminal widget head is now decorative; flag for owner if the shortcut should return as a non-reserved key. The one remaining `metaKey/ctrlKey` mention is an early-return guard with no `preventDefault`.)*

- [x] **Step 7: `aria-current` nav sync.** In `navigate()`, when toggling `.active` on nav items, also set/remove `aria-current="page"`. *(Applied to `.nav-item` elements only, per Task 4's markup.)*

- [x] **Step 8: Verify.** In the browser: Tab reaches shelf tiles and file-tree rows, Enter activates them; digit `2` switches to Projects only when the terminal input is not focused; Ctrl+1 switches the browser tab (no longer hijacked); play button toggles glyph + aria-label (inspect in devtools). `grep -n "metaKey\|ctrlKey" scripts/app.js` → no shortcut hijack remains. *(Grep: single match is the modifier early-return guard (no preventDefault, no navigation). `node --check scripts/app.js` passes. Browser pass deferred to reviewer.)*

---

## Batch 3 — Mobile/iOS, motion safety, dead code

### Task 7: Mobile & iOS correctness

**Files:**
- Modify: `stylesheets/styles.css` (`.app` ~62-105)
- Modify: `stylesheets/mobile.css` (mini player ~161-169, touch targets, mob-nav ~104)
- Modify: `index.html` / `scripts/app.js` (mini play control)

- [x] **Step 1: dvh.** In `styles.css` `.app`: keep `height: 100vh;` and add `height: 100dvh;` on the next line (fallback pattern). Check `mobile.css` for other `100vh` uses and apply the same pattern. *(Done at styles.css `.app`. mobile.css has no `100vh`; the only other use was `body { min-height: 100vh }` in styles.css — same fallback pattern applied there too.)*

- [x] **Step 2: iOS zoom.** In `mobile.css` ≤767px block: `.np-widget-input input { font-size: 16px; }`.

- [x] **Step 3: Working mini play control.** Remove the `.player::after { content:'▶' ... }` pseudo-element (`mobile.css` ~161-169). Instead, in the ≤767px block, un-hide only the play button: `.player-center { display: flex; }` scoped to show just `#np-play` (hide `.player-controls` siblings and `.player-progress`), OR simpler: keep `.player-center` hidden and move nothing — add a rule that displays `#np-play` absolutely positioned at the right of the player bar: check the current mini-player layout (`.player-left` spans full width) and pick the approach that doesn't disturb it. Style with dark tokens (`color: var(--dark-fg)`; background `var(--accent)` like desktop). It must be ≥44px tappable. *(Took the un-hide approach: `.player-right` stays hidden, `.player-center` becomes a row, `.player-progress` and `.player-controls .icon-btn` hidden, leaving the real `#np-play` — so the app.js glyph/aria-label toggle works untouched (no index.html/app.js edits needed despite the task's file list). Button restyled 44×44, `background: var(--accent)`, `color: var(--dark-fg)`. The phone grid was already `1fr auto`, so it slots into the free `auto` column.)*

- [x] **Step 4: Touch targets** (≤767px block in `mobile.css`):

```css
.icon-btn, .like { min-width: 44px; min-height: 44px; }
.nav-item { min-height: 44px; }
.mob-tab { min-height: 48px; }
```

Verify visually the player bar doesn't grow awkwardly — if 44px is too tall for the bar, use `position: relative` + `::before` hit-area expansion instead:

```css
.icon-btn::before { content: ''; position: absolute; inset: -8px; }
```

*(Simple min-sizes used; no `::before` hit-area needed — the phone player bar is 58px so 44px targets fit (min-width/min-height beat the desktop `width/height: 32px` regardless of specificity). `.icon-btn`s are display:none on phone after Step 3; the rule still future-proofs them.)*

- [x] **Step 5: mob-nav token bg** (`mobile.css` ~104): `rgba(11,11,15,0.96)` → `color-mix(in srgb, var(--dark-bg) 96%, transparent)`.

- [x] **Step 6: Verify.** DevTools responsive mode at 375px and 390px: mob-nav fully visible, play control tappable and visible (light-on-dark), focusing terminal input does not zoom (font-size ≥16px computed), tab bar background matches player warmth. *(Browser pass deferred to reviewer per batch instructions. No new animations introduced, so no new reduce-motion path needed for this task.)*

### Task 8: Motion safety & runtime performance

**Files:**
- Modify: `scripts/animations.js`, `scripts/terminal.js` (intro), `scripts/enhancements.js` (tickEQ), `scripts/app.js` (heatmap fetch, clock)
- Modify: `stylesheets/animations.css` (reduce block ~242-254), `stylesheets/styles.css` (eyebrow min-height)

- [x] **Step 1: Shared reduced-motion flag.** At the top of `animations.js`:

```js
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Gate: `startStatCounters` (set final numbers immediately), `startEyebrowCycle` (set first phrase statically, no cycle), `typeTagline`/`typewriter` (set full text immediately), scroll-reveal sub-typewriter (leave text as-is). Same pattern in `terminal.js` for the boot intro (print intro lines instantly, input enabled immediately) and in `enhancements.js` for `tickEQ` (don't start the loop). *(Done. Each of the three files is a separate IIFE, so each declares its own local `REDUCED_MOTION` const. `startStatCounters`/`typeTagline` just early-return (markup already holds the final numbers/full text); `startEyebrowCycle` sets `EYEBROW_PHRASES[0]` statically; `runIntro` in terminal.js prints all intro lines via `lineHTML` instantly and enables/focuses the input; `startEQ()` in enhancements.js never starts under reduce.)*

- [x] **Step 2: CSS reduce coverage.** In `animations.css` reduce block add:

```css
  .tile .art::before, .tile .art::after,
  .eq span { animation: none !important; }
```

(Check the actual selectors carrying `px-*` and `eq` animations in `styles.css` ~495-665, 895-898 and list them explicitly.) *(Actual carriers: the six `px-*` loops all live on `.tile .art[data-pid="01".."06"]::after` and `eq` on `.eq span` — the blanket `.tile .art::after` covers all six (plus the static `::before` pixel grid, harmless); noted in a comment inside the reduce block.)*

- [x] **Step 3: Eyebrow layout lock.** `.hero-eyebrow` in `styles.css`: add `min-height: 1.4em;` so the delete-cycle never collapses the line.

- [x] **Step 4: Clear reveal transition delays.** In `observeRevealTargets` (`animations.js` ~153): after adding `.visible`, clear the inline delay:

```js
el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
```

*(Added inside the `revealObserver` callback — that's where `.visible` is actually applied, not in `observeRevealTargets` itself.)*

- [x] **Step 5: Idle-stop the EQ loop.** In `enhancements.js` `tickEQ` (~106-115): when the energy value decays to ~0, cancel the rAF loop; restart it from the scroll listener. Skip entirely under reduced motion (Step 1). *(`tickEQ` returns when energy decays to 0 (after writing the idle amp/speed values, ~1s after activity stops); `startEQ()` guard (`eqRunning` flag + REDUCED_MOTION) restarts it from the scroll listener AND from the click/key/pointermove "nudge" listeners — plan said scroll only, but the nudges also feed energy, so without restarting there the pre-existing "feels alive without scrolling" behavior would silently die.)*

- [x] **Step 6: Guard the hidden heatmap fetch.** In `app.js` (~426-433): before fetching `data/github-commits.json`, check the heatmap section is visible: `const hm = document.getElementById('heatmap'); if (!hm || hm.closest('.section')?.style.display === 'none' || !hm.closest('.section') || hm.offsetParent === null) return;` — simplest robust form: `if (!hm || hm.offsetParent === null) return;`. *(Implemented as `if (hm && hm.offsetParent !== null) { ... }` guarding the whole existing heatmap block — equivalent to the early-return form (the code isn't a function), and it also skips the GitHub-API live-fallback fetches, not just the static file.)*

- [x] **Step 7: Remove the no-op clock interval** (`app.js` ~86-93): `#clock` doesn't exist; delete the block and its `setInterval`.

- [x] **Step 8: Preserve subtitle markup.** The section-sub typewriter (`animations.js` ~157-162) flattens `textContent`, destroying the styled `help` span (`index.html:130`). Skip typewriting any `.sub` whose `children.length > 0` (leave it fully rendered), and under reduced motion skip all.

- [x] **Step 9: Verify.** In browser devtools, emulate `prefers-reduced-motion: reduce` (Rendering tab): reload — loader exits, all text is instantly present, no counters/typewriters/cycling, tile art static, terminal intro instant. Back to no-preference: hero animates as before; scroll then stop — check in the Performance panel that rAF activity stops ~1s after scrolling ends; "Now Playing" subtitle keeps its accent-colored `help` after reveal. Network tab: no request for `github-commits.json`. *(`node --check` passes on all four JS files. Browser/devtools pass deferred to reviewer per batch instructions.)*

### Task 9: Dead-code removal

**Files:**
- Modify: `index.html`, `scripts/app.js`, `scripts/enhancements.js`, `stylesheets/styles.css`, `stylesheets/enhancements.css`, `stylesheets/mobile.css`

**Interfaces:** Pure deletion — nothing may change visually or functionally. The heatmap section in `index.html` STAYS (owner may re-enable).

- [x] **Step 1: `index.html`**: delete the hidden sidebar block (comment `<!-- SIDEBAR REMOVED -->` through `</aside>`, ~lines 49-79). *(Deleted — 32 lines (53-84 incl. trailing blank). Pre-grep: `.sidebar`/`.sb-*` classes appear in no JS and only in the styles.css hide rule `.sidebar { display: none !important; }`, which was NOT in this task's deletion list and is kept (now inert).)*

- [x] **Step 2: `enhancements.js`**: delete the commented-out visualizer dead block (~184-572, marked `END DEAD-CODE`), the `_vizLidarOld` stub, and any now-unreferenced helpers. Keep the working liner-notes/setlist/EQ code. *(390 lines deleted (`/* DEAD-CODE START` through end of `_vizLidarOld`, incl. the inline `vizLidar` stub on the END line). Also deleted the now-unreferenced `const viz = {...}` fake-element stub and `fillViz()` no-op; KEPT `openViz()`/`closeViz()` no-ops because `window.__np` exports them (removing them from the export would change the debug interface — not pure deletion). Stale "Visualizer overlay" line dropped from the file header comment. `node --check` passes.)*

- [x] **Step 3: `enhancements.css`**: delete the `.viz-*` overlay ruleset (~20-282) including `vizFade`, `vizPulse`, `lidarSweep` keyframes. Keep `.liner-*` and `.setlist-*`. *(266 lines deleted (incl. the `/* (visualizer removed) */` marker) + the stale header-comment line. Side benefit: this removed the file's only `var(--secondary)` uses — an undefined token.)*

- [x] **Step 4: `styles.css`**: delete `.playlist` component (~667-762); orphaned `.ide-tabs`/`.ide-tab` (~1075-1103); `.player-left .cover` (~1466-1474) and `.player-left .cover-icon-np` (~195-203); `.distribution` (~1349-1361); trailing duplicate `@media (max-width: 980px)` block (~1602-1618). Before each deletion run `grep -rn "<classname>" index.html scripts` to confirm zero references (accounting for JS-built DOM). *(All six blocks deleted — ~177 lines (playlist 97, ide-tabs/ide-tab 30, cover 9, cover-icon-np 9, distribution 14, trailing @media 18). Pre-greps confirmed zero DOM/JS-built references for each (playlist/ide-tab/distribution/scroll-progress/data-history exist nowhere in index.html or JS-generated markup; `.player-left .cover` was referenced only from the enhancements.js dead block deleted in Step 2, `.cover-icon-np` only from the app.js dead branch deleted in Step 6). The trailing @media block was fully superseded by mobile.css (loaded later, same-or-stronger declarations) except its `.nav-pill` hide at ≤980px — inert because `.nav-pill` exists only in CSS, not in any markup.)*

- [x] **Step 5: `mobile.css`**: delete `.playlist` overrides (~49-50, 238-243) and the duplicate `.top-nav` rule inside the ≤767px block (~92-95). *(Done (~17 lines). Deviation-additions required by Step 7's grep target: also deleted the orphaned `.ide-tabs`/`.ide-tab` overrides (~219-220) and the orphaned `.player-left .cover`/`.cover-icon-np` mini-player rules (~151-157, removed during the Task 7 Step 3 rewrite of that block) — neither was in this step's list but all match the Step 7 sweep and had zero references.)*

- [x] **Step 6: `app.js`**: delete dead wiring — `#scroll-progress` block (~121-131), `#distribution` generator (~450-462), `.cover-icon-np` swap (~507-516 no-op branch), `[data-history]` binding (~141), `ICONS['07']` (~205). Keep guarded `#screen-label` only if trivially guarded already — otherwise delete too. *(All deleted (~41 lines): scroll-progress 13, distribution 15, data-history 8, ICONS['07'] 1, npCoverIcon const + the `pf` lookup that only fed it 4. `#screen-label` kept — trivially guarded (`if (screenLabel)`). Header comment updated to drop playlist/distribution. The renderEmptyView copy "browse the playlist above" kept — user-visible prose, not a selector, and changing copy isn't pure deletion. `node --check` passes.)*

- [x] **Step 7: Verify.** `grep -rn "playlist\|viz-\|cover-icon-np\|distribution\|ide-tab\|data-history" index.html scripts stylesheets` → no functional matches (allow words in prose/comments unrelated to selectors). Open the site: home, projects (open 2-3 files), about, contact, terminal commands, liner notes, setlist — everything works and looks identical. *(Grep clean: the only remaining matches are prose — terminal help text/boot copy ("playlist"), STAR/fortune copy ("distribution(al)"), index.html bullet copy, and the renderEmptyView sentence. Zero selector/attribute matches. All four JS files pass `node --check`. Browser pass deferred to reviewer per batch instructions.)*

### Task 10: Full-site verification pass

**Files:** none (read-only)

- [ ] **Step 1: Reference integrity sweep.** `grep -rn "var(--" scripts stylesheets index.html | grep -oP "var\(--[a-z0-9-]+" | sort -u` → check every token in the list is defined in `styles.css` `:root` (or `--eq-amp`/`--eq-speed` set by JS).

- [ ] **Step 2: Browser pass** (desktop width): loader → hero → terminal intro; run `help`, `play 3`, `shuffle`, `setlist quant`, `contact`; open every nav page; open liner notes; like a track; keyboard-only pass (Tab/Enter through nav, tiles, tree, player).

- [ ] **Step 3: Mobile pass** (375px + 390px devtools): mob-nav visible and working, mini play control works, no horizontal scroll, input focus doesn't zoom.

- [ ] **Step 4: Reduced-motion pass**: emulate and reload — static but complete content.

- [ ] **Step 5: Report.** Summarize all changes by file with line counts, list the deferred items (image compression, unused Perchance.pdf/perChance.tex, keyframe relocation, email confirmation) for the owner.
