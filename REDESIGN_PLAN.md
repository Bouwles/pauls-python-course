# REDESIGN PLAN

The working plan for `REDESIGN.md` (the brief): rebrand to Fixwick, a new game-like look, better characters, a real-projects curriculum, Pro subscriptions and growth basics. Ticked items are built and checked by looking at screenshots or by tests. Non-obvious choices go in `DECISIONS.md`.

Before screenshots (the build as it was): `tests/screenshots/redesign/before/`. After screenshots: `tests/screenshots/redesign/after/`.

---

## Phase R1: Visual reset (Sections 2 to 5)

Remove the "AI product" house style (cream paper, serif body, amber accent, tracked uppercase labels, hairline boxes, grey text buttons, the wavy underline, the docs layout) and build the Fixwick design system.

- [x] `palette.json` gains the UI palette (night default, day secondary); `tokens.css` is generated from it, with no raw hex in components
- [x] Fonts: m6x11plus (pixel display, 18/36/54 px), Atkinson Hyperlegible Next (reading), JetBrains Mono (code); every serif removed
- [x] Pixel frames as 9-slice sprites: `frame-panel`, `frame-paper`, `frame-dialogue`; no border-radius, no hairline region borders, hard offset shadows only
- [x] Pixel icon set (run, check, stop, lamp hint, history, reset, keyboard, spanner, duck, shelf, map, lock, heart, floppy, offline cloud, two-frame spanner loader)
- [x] Components: chunky buttons with press states (primary, go, danger, quiet; disabled and locked distinct), folder tabs, `fixwick-night` and `fixwick-day` editor themes, console with inline blinking input, check report, Moss's error panel, HUD save status
- [x] Workbench rebuilt: HUD, level-path step bar with Hint and Dennis, paper job ticket, editor at 60 per cent or more of the width, output and checks split, dialogue box with large portraits; phone layout with three pixel tabs
- [x] Ask and Ship cutscenes (scene, walk-in, ticket pin; demo panel, stamp and dust, object to the Shelf)
- [x] Landing page: dusk harbour scene with wordmark, playable first project in a game window, "What you'll build" shelf, district map, pricing band, footer credit
- [x] Map: 3x on a night sea, whole-number zoom, district side sheet of paper tickets, logbook list view
- [x] Shelf, Morning Rounds, Drills, Handbook, Settings restyled on frames
- [ ] R1 acceptance: the Look checklist in Section 11, checked on screenshots

## Phase R2: Rebrand (Section 1)

- [x] `lib/brand.ts` holds every brand string; nothing else hard-codes the name
- [x] Content uses a `{{town}}` token replaced by the content compiler; "Saltmarsh" and "Paul's Python Course" removed everywhere
- [x] A test greps the built output and fails on either old name
- [x] Wordmark sprite, the spanner-and-fish-weathervane mark, favicons (16, 32, 180, 512), OG image rendered from the sprite pipeline
- [x] "Made with [heart] by Paul Nercessian" with the 8x7 pixel heart (alt "love"), in the footer and at the bottom of Settings

## Phase R3: Characters (Section 6)

- [x] Specs in `CHARACTERS.md` rewritten to Section 6.3, with the new Act ownership
- [x] Portraits at 64x64 (shown 3x): Moss and Pip with at least 10 expressions, clients with at least 6; blink and one idle each
- [x] World sprites at 32x48 (Moss 48x40, Dennis 16x16); head icons at 16x16
- [x] Silhouette tests and before/after sheets in `sprites/review/`; a `/dev/sprites` review page (development only)
- [x] Sheet layout and frame order documented in `sprites/README.md` for a commissioned artist
- [x] Workshop redrawn at 320x180; harbour exterior and key buildings redrawn on the same rules
- [x] Reactive lines (at least 40 for Act I, from `ast` checks and run results), no repeats of the last 30 lines, recap on return

## Phase R4: Curriculum (Section 7), after R1 passes

- [x] Nine Acts in the new structure; Act I free
- [ ] Act I rewritten as the 13 real projects, reusing step content where it fits; every check passing
- [ ] Every later Act has its full project list, with existing written Jobs mapped onto the new projects where they fit and at least the first project of each fully written
- [x] New job fields enforced by validation: `project_name`, `client`, `portfolio_readme`, `downloadable`, `datasets` (with licences)
- [ ] Real public datasets where data is used, recorded in `CREDITS.md`, with small cleaned copies bundled
- [ ] Every Act I project downloads as a runnable folder with a README

## Phase R5: Pro subscriptions (Section 8), after R1 passes

- [x] `lib/plans.ts` (prices configurable), `PaymentsProvider` interface, a merchant-of-record provider (default) and Stripe behind the same interface, and a sandbox provider for local and test runs
- [x] `entitlements` with idempotent, signature-checked webhooks; 7-day grace period on past due
- [x] Server-side gating: the content bundle split into a free bundle and per-project Pro payloads; a free user gets 403 for Pro content (tested)
- [x] The gate scene after the Act I capstone, locked districts with a padlock, no mid-lesson paywalls
- [x] Pricing page, billing in Settings, classroom seats, the under-18 confirmation and "Ask a parent" link
- [x] Your work is always yours: lapsed learners keep read and download access to everything they built

## Phase R6: Growth basics (Section 9)

- [x] The public Python Handbook at /handbook: static concept pages with runnable examples, titles, descriptions, canonical URLs, sitemap, robots and structured data
- [ ] The first 60 long-form Handbook pages (content/handbook/) for Act I and II concepts
- [x] Shareable project pages (opt-in) with OG images from the pixel art
- [x] Act certificates (Pro) with verification URLs, PNG and PDF
- [x] Funnel events and an owner-only `/admin/metrics` page

## Acceptance (Section 11)

- [ ] Every Look, Characters, Brand, Curriculum, Money and Quality item, checked on screenshots and tests
- [ ] After screenshots of every screen at 1440x900 and 390x844, night and day

---

## Owner actions (the only things that wait for you)

1. Choose and buy a domain, then set `BRAND.domain` in `lib/brand.ts`.
2. Create a payments provider account (the default is a merchant of record: Paddle or Lemon Squeezy) and add its keys to `.env`.
3. Set the final prices and the founder offer in `lib/plans.ts` and in the provider's dashboard.
4. Review the drafted terms, privacy and refund policy pages.

Everything else is built against a sandbox payments provider and test data, so it works end to end before any of these.
