# v3 Dark Editorial - Design Source and Decisions

**Status:** in progress, uncommitted on branch `redesign`.

## Source

Claude Design project `3d1e760f-d167-4443-9594-1b76fb16c2c3` ("Student Portfolio Redesign"), file `Portfolio Redesign.dc.html`.
Read it with the `DesignSync` tool (`get_file`); it is not checked into this repo.

The file holds two turns:

- **Turn 1** offered three directions: `1a` Polished Pro, `1b` Type-Forward, `1c` Side-Nav.
- **Turn 2** option `2a` is the chosen target: a full homepage build-out of `1b`.

**We are implementing 2a.**

## What 2a specifies

One dark field at `#0C0B09`, Space Grotesk throughout, hairline rules instead of cards.
The name is the thesis: `Abba / Ndomo.` at 186px, weight 700, line-height 0.85, letter-spacing -8px, with the surname receding and the period in accent.

Section order: nav, hero, `01 Work`, `02 Education`, `03 Writing`, footer.
Hero splits under the name into three columns: bio plus pills, a 2x2 stat grid, and status plus CTA stack.
Work and Education rows use a `200px 1fr 240px` grid: org, body, dates.

## Deliberate deviations from 2a

These are intentional.
Do not "fix" them back toward the design file without a reason.

- **Real content replaces placeholders.** 2a ships two roles, one of them a `Company ②` stub, plus invented blog posts.
  The site carries three real roles (Altura, GT Student Fund, KPMG) with actual CV bullets and dates.
- **Contrast floors raised.** 2a's foreground ramp (`#777/#555/#444/#333`) measures 4.3:1 down to 1.5:1 on the page background, and it puts 11px labels on the bottom two.
  The `:root` ramp keeps the recessive feel but clears 4.5:1 through `--fg-3`; `--fg-4` is for rules and 40px+ numerals only.
  The surname is 38% white rather than 2a's 18%, which rendered it near-invisible at 1.6:1.
- **Nav follows the SPA, not the design.** 2a lists Work / Projects / Blog.
  The site is a single-page app with Home / Projects / About / Contact plus a Resume link.

## Rejected

- **Headshot in the hero.** Tried and removed on 2026-07-20.
  The portrait was bottom-aligned against the giant name, filling the empty field 2a leaves to the right of "Ndomo.".
  It read as awkward against the type-forward layout: the name is meant to carry the page alone.
  `headshot.jpeg` is still in the repo and still used elsewhere; only the hero placement was reverted.

## Outstanding

- **`03 Writing` is not built.** 2a's three blog cards are invented placeholder posts.
  Blocked on the owner: real posts, or drop the section.

## Verification method

Headless Chromium on Windows clamps the window to a minimum width of roughly 484px, so `--window-size=375` silently renders a 484px viewport and crops the canvas.
That reads as horizontal overflow when there is none.
To check phone widths, load the page in a `375px` iframe inside a wider window and screenshot that.
