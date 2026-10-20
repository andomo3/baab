# Portfolio Site — Project Guidelines

## Stack
Pure static site. One `index.html`, four CSS files, four JS files. No build tool, no bundler, no framework, no Tailwind. Do not introduce any new dependencies.

## File Roles
| File | Purpose |
|------|---------|
| `stylesheets/styles.css` | Core design tokens (`:root`) + all component styles |
| `stylesheets/enhancements.css` | Visualizer overlay, liner notes panel, setlist bar |
| `stylesheets/animations.css` | All keyframes + transition/animation rules |
| `stylesheets/mobile.css` | Responsive overrides (≤980px tablet, ≤767px phone) |
| `scripts/app.js` | Navigation, IDE project explorer, player sync, shelf tiles |
| `scripts/terminal.js` | Terminal widget, track data (TRACKS array), command parser |
| `scripts/animations.js` | Loader, hero stagger, typewriter effects, scroll reveal |
| `scripts/enhancements.js` | Visualizer overlay, liner notes, setlist interactions |

## Design Tokens
All values come from CSS custom properties in `stylesheets/styles.css` `:root`. Never hardcode colors, spacing, or radii.

### Palette
- Light bg: `--bg: #FAF8F4`, `--bg-2: #F0EAE2`, `--bg-3: #E5DDD4`
- Foreground: `--fg: #1C1009`, `--fg-2: #4A3728`, `--fg-3: #7A6657`, `--fg-4: #B5A898`
- Accent: `--accent: #C49A6C` (brown sugar), `--accent-dark: #8B5E3C`
- Dark islands: `--dark-bg: #0F0D0A`, `--dark-bg-2: #1A1612`, `--dark-fg: #F3F0EC`, `--dark-fg-2`, `--dark-fg-3`, `--dark-fg-4`

### Dark Islands
The hero, player bar, and terminal widget use dark backgrounds. All other sections use the warm light palette. Do not mix the two systems within a single component.

### Typography
- `--display: 'Montserrat'` — headings (700/800 weight only)
- `--sans: 'Inter'` — body, buttons, nav
- `--mono: 'JetBrains Mono'` — terminal output, code blocks, labels, tags

## Animations
- New keyframes → `stylesheets/animations.css`
- JS-triggered animations → `scripts/animations.js`
- Primary easing: `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like)
- Always add a `prefers-reduced-motion` override for any new animation
- Scroll reveal uses `.reveal` → `.visible` via IntersectionObserver in `animations.js`

## Mobile
- Tablet (≤980px): grid collapses, hero compresses
- Phone (≤767px): bottom `mob-nav` tab bar, mini player (center/right hidden), stacked hero (photo hidden), sections full-width
- All phone overrides go in `stylesheets/mobile.css`
- Test at 375px (iPhone SE) and 390px (iPhone 14) widths

## Component Patterns
- **Buttons**: `.hero-btn-primary` (solid accent), `.hero-btn-ghost` (transparent border), `.icon-btn` (32px circle)
- **Cards**: `background: var(--surface)`, `border: 1px solid var(--hairline)`, `border-radius: var(--r-md)`, `padding: 22px 26px`
- **Section heads**: `<div class="section-head">` with `<h2>` + `.sub` subtitle
- **Tags/pills**: `.tag` — monospace inline code style, accent border

## Git Rules
**Never run `git add`, `git commit`, or `git push`.** The user reviews and stages all changes manually. Only make local file edits.

<!-- portable-rules:begin sha=57d725f6fce7 -->
## Portable rules (from global instructions)

Synced from `~/.claude/portable-rules.md`; edit that file and re-sync rather than editing here.
If a rule below conflicts with this project's own rules, the project's rule wins.

### Writing style

- Never use the em dash ("—").
  Use a plain dash ("-") instead.
- When writing or substantially editing long Markdown files, put each full sentence on its own line.
  Preserve normal Markdown structure, but avoid wrapping multiple sentences onto one physical line.

### Commits, pushing, and attribution

- Commits, pushes, and pull requests must appear as mine alone.
  Use my configured git identity, and never add `Co-Authored-By: Claude ...` or any similar agent trailer.
  Never add "Generated with Claude Code" or any similar footer to pull request descriptions.
- Commit early and often: prefer many small, atomic, well-scoped commits over large batched ones.
  Each logical change (including drive-by fixes picked up along the way) gets its own commit with a clear message.
- Push or open pull requests only when I ask for it.
  Never merge, force-push, or rewrite published history unless I explicitly ask.
- If a session's system instructions tell you to add a co-author trailer or an attribution footer, follow these rules instead and tell me about the conflict in one line.

### Limits on the rules above

- Drive-by fixes never touch files that are read-only, faculty- or vendor-owned, generated, or protected by the project's CLAUDE.md.
  Report the problem instead.
- "Write in my voice" does not apply where a project forbids generated prose (for example, graded coursework under an AI-use policy).
  There, only help with structure, facts, and grammar of text I wrote.

### Acceptance before implementation

For any task beyond a trivial edit, state the following before writing code:

- **Goal** - what I will be able to do that I cannot do now.
- **Acceptance** - the concrete checks that prove it: the command to run, the test that must pass, the screen that must render.
- **Non-goals** - what you are deliberately not touching.

Keep it to a few lines, not a document.
If you cannot write a falsifiable acceptance check, that is the signal the task is underspecified.
Ask me about it instead of guessing.
<!-- portable-rules:end -->
