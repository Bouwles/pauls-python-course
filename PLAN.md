# PLAN

The build follows Section 22 of `pauls-python-course-prompt.md` (the spec). Each phase ends with a working, tested app. Ticked items are built and checked in a browser or by tests. Deferred items say why. Non-obvious choices are in `DECISIONS.md`.

Legend: `[x]` done, `[~]` partly done (see note), `[-]` deferred (see note), `[ ]` not started.

---

## Phase 1: The vertical slice

### Setup
- [x] Next.js 16 (App Router), TypeScript strict, CSS Modules, `tokens.css` (light and night themes)
- [x] Fonts self-hosted (Source Serif 4, IBM Plex Sans, JetBrains Mono, Atkinson Hyperlegible)
- [x] `palette.json` (24 colours plus Pip's sheen) and tool palette tokens
- [x] Sprite pipeline: text grids in `sprites/src` to PNG sheets and JSON in `public/sprites`; scenes from JSON; night frames; previews
- [x] Cross-origin isolation headers (COOP, COEP, CORP) in `next.config.ts`
- [x] Copy lint (`npm run lint:copy`): em dashes, emoji, banned phrases, UI exclamation marks, American spellings

### Sprites and world
- [x] Moss, Pip, Dennis, Bea; the learner's layered character (8 species, coats, jumpers, accessories)
- [x] Workshop interior (day and night), the Harbour Front map (pannable, list equivalent)

### Accounts and saving
- [x] Postgres schema, RLS, migrations (`supabase/migrations`)
- [x] Local backend (PGlite running the same migrations, local auth, a dev mailbox) so the app runs with no keys
- [x] Email and password, magic link
- [x] Local-first store (IndexedDB per learner), background sync, quiet sync indicator
- [x] Autosave (2 s), snapshots on Run and Check, version history, restore on another device
- [x] Guest progress merged into a new account

### Workbench
- [x] CodeMirror 6 editor; Pyodide in a module Web Worker; Run, Stop (interrupt buffer, restart fallback), interactive `input()`, output caps
- [x] Test harness (output, function, variable, structure, custom checks), Check, test report with the first failure first, diagnoses
- [x] Step types: Ask, Predict, Investigate, Worked example, Pip's Version, Parsons, Fix, Modify, Make, Ship
- [x] Hints (Nudge, Plan, Shape) and the server-side solution gate (3 hints and 8 minutes, or passed)
- [x] Error explanations under tracebacks; Explain it to Dennis; phone layout (Brief, Code, Output)

### Content, pages, tests
- [x] Content format, Zod schemas, validation, bundle build; content tests (reference passes, starter fails, predicts and cards verified by running)
- [x] Act I Jobs 1 to 4
- [x] Landing page with playable Job 1; sign up, log in, character, placement question; map; 404, privacy, terms, credits
- [x] Vitest unit tests; Playwright end-to-end (sign-up to restore on another device, input(), Stop, guest merge, review, export, deletion); axe on every page; screenshots at 1440 and 390, light and dark

## Phase 2: Act I and II complete
- [x] All of Act I (14 Jobs plus the Python at Home sidequest) and Act II (17 Jobs)
- [x] FSRS review deck (one card per concept, varied cards), Morning Rounds, card variants for every concept
- [x] Step-through visualiser (frames, heap arrows) and Living Visualisations: Old Tom's lamp, Mira's pigeonholes
- [x] Shelf, export to zip and to a GitHub-ready repository
- [x] OAuth (Google, GitHub) behind the owner's keys; character customisation; settings; dark mode; Concept Index
- [x] Act I and II characters (Bea, Ferro, Tom, Mira, Agnes, Gwen, Okonjo, Vance, Sanjay, Dev, Kat, Nell) and buildings
- [x] Drill mode
- [x] The workshop's git for Act II (a simulated repository with real commands)

## Phase 3: Acts III to V
- [x] Content for Acts III (13 Jobs), IV (10) and V (13), all written and tested
- [x] Package loading (NumPy, pandas, matplotlib, scikit-learn) with town-voice loading lines; plot rendering; data files
- [x] Living Visualisations for recursion (Nell's junk tower), sorting (Nell's piles), dictionaries (the post office drawers), graphs (the town map, `show_graph`) and gradient descent (the hiker, `show_hill`), all driven by the learner's own code
- [x] Placement test: one section per Act for Acts I to III; passing places the Act's Jobs, opens the next Act and adds its concepts to review
- [x] Take It Home flow: per-OS setup guide, starter zip, pytest report upload, results on the Job page

## Phase 4: Acts VI to VIII and extras
- [x] Content for Acts VI (13 Jobs), VII (10) and VIII (five capstones, University Readiness, Moss's Radio, The Lamp Room), all written and tested
- [x] The `ppc` CLI (`cli/`): `ppc login` (device code), `ppc get`, `ppc check`, `ppc submit`, `ppc status`, `ppc logout`; installed with `pip install <site>/ppc.zip`
- [x] Take It Home Jobs: Hello, PyTorch (Act VI), The Sea Wall Gate with Gymnasium (Act VII), the Flask and Pygame capstones, and the Python at Home sidequest; heavy suites were run with the real packages when written
- [x] RL gridworld with Sir Reginald (`show_grid`: values as tints, Q-values on hover, sped up, pausable, steppable) and the Crab League
- [x] Teacher and class mode (classes, join codes, progress, assignments, read-only code)
- [-] Optional AI tutor: off by default and waiting for the owner's decision (Section 19). Nothing in the product depends on it.
- [x] Penhallow conclusion (Moss's Radio, The Lamp Room), Moss's radio playing in the workshop, cosmetics (brass name plate after Act I, lighthouse keeper's coat in the lamp room), twelve hidden Dennises with Moss's note
- [x] Public profile pages (opt-in, `/u/<address>`)
- [x] Also from the spec, built late: Moss's code style review on every Ship (Section 5.1), the opt-in weekly note from Moss (Section 16), one-click push of the Shelf to GitHub (Section 8.7), the lamp room scene for the finale

---

## Phase report

### Done
Everything ticked above. At the last full run:
- `npm run build`: sprites, the content bundle (0 errors, 0 warnings) and the Next.js build all pass.
- `npm run test:content`: 1,873 of 1,873 pass. Every checkable step's reference solution passes and its starter fails; every predict answer and review card is confirmed by running it.
- `npm test`: 84 unit tests in 16 files (harness, scheduler, store, sync under RLS, git simulator, Crab League, the `saltmarsh` module, the CLI, Moss's review, the weekly note, GitHub push, progress rules, teacher RLS).
- `npm run test:e2e`: 31 tests (the learner journey to another device, input() and Stop, guest merge, review, export, deletion, the teacher flow, and axe on 26 pages).
- `npm run lint:copy`: 0 findings. TypeScript strict: clean.

### Content
- All 99 Jobs across the eight Acts, plus three placement sections: Act I (14 and the Python at Home sidequest), II (17), III (13), IV (10), V (13), VI (13), VII (10), VIII (8).
- 246 concepts with 1,552 review cards, each verified by running.
- The Penhallow thread runs through 54 notes found in the code, and resolves in The Lamp Room.

### Lighthouse (landing page, production build)
- Desktop: 99 to 100 on performance, 100 on accessibility, best practices and SEO.
- Mobile (simulated slow 4G, 4x CPU): 83 to 87 on performance, 100 on the rest. The observed paint is 150 ms; the simulation charges the page for Next.js's own JavaScript (about 140 KB gzipped). Fonts go through next/font with size-matched fallbacks.

### Deferred, and why
- Server-side sandboxed checking (Section 12.4): an interface (`lib/server/sandbox.ts`) with a TODO. Browser checking and reported Take It Home results are trusted, and the Job page says so.
- The AI tutor (Section 9.7): owner decision; off.

### Known issues
- Hidden tests are fetched at Check time and run in the browser, so a determined learner can read them (accepted in the first build, Section 12.4).
- The seal learner head is better than it was but still a little bear-like in brown coats.
- Mobile Lighthouse performance is in the mid-80s (see above), under the 90 the checklist asks for; desktop meets it.

---

## Deliberate stubs
- `lib/server/sandbox.ts`: server-side re-running of uploaded projects and capstones. Results are trusted until it exists.

## Owner decisions (Section 19)
Recorded in `DECISIONS.md` under "Owner decisions". Defaults are in use until the owner says otherwise: free, Vercel plus Supabase (keys from the owner), AI tutor off, British spelling, self-hosted events only.

## What the owner needs to provide for production
- A Supabase project: run every file in `supabase/migrations` in order; create a private Storage bucket called `submissions`; enable email (with magic links), Google and GitHub in Auth, with `<site>/auth/callback` as a redirect URL.
- On the host: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_OAUTH_PROVIDERS` (see `.env.example`).
- Google and GitHub OAuth apps for sign-in (client id and secret go into Supabase, not the host).
- Optional: a Resend API key (weekly note), a cron secret, and a second GitHub OAuth app for pushing the Shelf (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`).
