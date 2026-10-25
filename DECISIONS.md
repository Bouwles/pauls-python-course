# DECISIONS

One line per non-obvious choice: the choice, then the reason.

## Owner decisions (Section 19, defaults in use)
- Pricing: freemium (REDESIGN.md 8). Act I and the Handbook are free; Pro is US$9 a month or US$72 a year, set in `lib/plans.ts` and the provider's dashboard. No ads anywhere. Reason: the redesign brief.
- Hosting: Vercel plus Supabase free tiers; the owner supplies keys in `.env.local`. Until then the app runs on the local backend (below). Reason: spec default, and nothing should block on keys.
- AI tutor: off and not built until Phase 4. Reason: spec default.
- Spelling: British. Reason: spec default, suits the town.
- Analytics: self-hosted only: the learner's `events` table, and `funnel_events` for the owner's funnel (REDESIGN.md 9.3). No third-party trackers, no cookies for it. Reason: spec default.

## Environment
- npm uses `registry.yarnpkg.com` (project `.npmrc`). Reason: the development network's Fortinet firewall re-signs TLS for registry.npmjs.org with an untrusted certificate; the Yarn mirror serves identical packages with valid TLS, so certificate checking stays on.
- TypeScript pinned to 5.9. Reason: TypeScript 7 is the new native compiler and Next's build type-check depends on the JS API.

## Architecture
- Data access is plain SQL through one small interface, run against PGlite locally and Supabase Postgres in production, with RLS enforced in both by setting `role authenticated` and the JWT `sub` claim per transaction. Reason: one schema, one set of queries, and the RLS policies get exercised by local tests instead of only in production.
- Local development backend: when `SUPABASE_URL` is not set, auth is handled by a small built-in email/password and magic-link implementation (scrypt hashes, httpOnly session cookie, magic links printed to the server log and shown at `/dev/mailbox`). Reason: the app must be runnable and testable end to end before the owner creates a Supabase project.
- Content tests run the reference solutions in Pyodide under Node (`scripts/run-content-tests.ts`), not CPython. Reason: same interpreter version and same harness as the learner's browser, so a pass means a pass for them.

## Product and design
- Townsfolk are animals (table in CHARACTERS.md). Reason: Moss, Pip and Dennis already are; the spec describes clients by look and role but not species, and animals fit the pixel town. Learner species are not reused for clients.
- Typography: Source Serif 4 for lesson prose and headings, IBM Plex Sans for UI, JetBrains Mono for code, Atkinson Hyperlegible for the dyslexia-friendly option. Reason: a book serif reads well at length and gives the "printed field guide" feel; Plex is sturdy and engineered, like a workshop; JetBrains Mono separates 0/O and 1/l/I clearly. All self-hosted for COEP.
- Code ligatures are switched off everywhere. Reason: JetBrains Mono draws `==` as one long glyph, which actively misleads a beginner learning `=` against `==`.
- Accent amber is split into a fill (#c8811e, with ink text) and an "ink" shade (#8f560c) for text and focus rings. Reason: the spec's amber is 2.8:1 on paper, below WCAG AA for text and focus indicators.
- The Workbench scene strip sits top-right, with hints and Dennis below it. Reason: hints come from Moss, so they sit next to Moss; the centre stays for code.
- Step list: learners can open any step, but a Job ships only when its Make step passes. Reason: respects learners who know the early material without letting them skip the step that counts.
- An Act opens when the previous Act's final (Ship) job ships. Within an open Act every written job is available, with the next one suggested.
- A building on the map lights up when any job there ships; Moss's workshop is always lit. Locked districts sit under an on-palette checkerboard dither: a state overlay, not sprite art.
- Night mode has night frames for every map sprite and scene, made by mapping each palette colour to a darker palette neighbour at build time; lit windows keep their lamp colours. Reason: "designed, not auto-inverted", and still on-palette.
- Portraits are the character's sprite at 2x (64x64) cropped to the head end, not separately drawn 64x64 portraits. Reason: one source of truth per character for now; hand-drawn portraits can replace them later without code changes.
- Concepts: f-strings and f-string decimals are one concept (`f-strings`), and `str()` is introduced in Reading the Wreckage alongside the TypeError it fixes. Reason: fewer, fuller concepts make better five-card review sets.
- Review scheduling is per concept (one FSRS card each); a review shows the variant seen least recently. New concepts first come up the next day. Reason: the spec's "card" is a concept with five or more variants.
- Morning Rounds, Drills and cards check code with the same harness as the Workbench, using the inline tests stored with each card.
- Sounds (bell, Run key, Ship stamp) are synthesised with Web Audio rather than recorded. Reason: original, nothing to license, tiny; off by default.
- The weekly email is not shown in Settings until it exists. Reason: no setting should do nothing.

- Later clients' species: Mr Ashby a lop-eared rabbit (drooping ears keep him clear of the learner's hare), Priya a puffin, Professor Wendt a hoopoe (the crest is the wild hair), the Crab Club committee three identical herring gulls in blazers, Sir Reginald a shore crab with a monocle, Ada Penhallow a very old white stoat in her winter coat.
- Living Visualisations driven by the learner's own code come two ways: the step-through visualiser reads the trace (pigeonholes, Nell's piles, post office drawers, Nell's junk tower for recursion, Old Tom's lamp), and the `saltmarsh` module lets a running program send frames (`show_grid` for Sir Reginald's racing grid, `show_graph` for the town map as a graph, `show_hill` for the gradient-descent hiker), played back with play, pause, step and speed. Reason: training loops and searches run thousands of steps, far past what a line-by-line trace can show, and the frames are still the learner's real values.
- Take It Home sidequests (Section 5.1) are optional, unnumbered Jobs inside an Act (`sidequest: true`). They never gate the next Act and are never suggested as "next". The first, Python at Home, closes Act I.
- The placement test is a set of placement Jobs (content/placement), one per Act for Acts I to III, built from the same step types. Passing every task in a section marks the Act's written Jobs as placed (they stay open), opens the next Act, and puts the Act's concepts in the review deck. No hints and no solutions in placement.
- An Act opens when the Act before it has its last written, non-sidequest Job shipped or placed. Reason: Acts III to VIII are only partly written; outline Jobs shouldn't lock written ones away.
- Capstone milestones are checked by the learner against Moss's checklist, with Moss's reason for every item; nothing pretends to be a human review. Their test plan and evidence are kept so a teacher can read them.
- The Crab League uses one fixed course (the Club Course) and a new race seed each ISO week, so Act VII Jobs can ship the course as data and learners can train on it. The server races each entry (50 runs) and stores the score; the page replays the first run in the browser with the same code, so the replay is the race that was scored. The table shows display names and scores only.
- Cosmetics are earned by real milestones only, and set by content (`ship.awards`): the brass name plate on the learner's desk at the end of Act I, the lighthouse keeper's coat in the lamp room. Moss's radio plays in the workshop once it's tuned.
- The Penhallow thread resolves in two Jobs at the end of Act VIII: Moss's Radio (tuning the valve radio picks up her call from the lighthouse) and The Lamp Room (she explains the machine on the hill, and the learner writes the tests it never had). Found notes are collected on the Shelf.
- Twelve hidden Dennises: four from the start, eight that turn up as their districts open. Finding all twelve shows Moss's note.

## Teacher and class mode, public profiles (Phase 4)
- Anyone can switch on "I teach a class" (profiles.role). It only unlocks making classes, never reading anyone: a teacher sees a learner only after that learner joins with the code. A restrictive RLS policy (0003) refuses classes from non-teachers, as well as the route. Reason: there is no way to verify teachers, and the learner's consent is the join.
- Join codes are six characters from the consonants without Y and the digits 2 to 9, made on the server and checked by a constraint. Reason: no O/0 or I/1 to misread off a whiteboard, and no words.
- Teacher pages are server-rendered, and every query runs as the teacher (asUser), so RLS decides what they see; the helpers in lib/server/classes.ts also require classes.teacher_id = the teacher, so a class member can't use the teacher views to read even their own class's roster.
- "Last 7 days" is the time on steps whose updated_at falls in the past seven days. Reason: step_progress holds running totals, not a daily log; the page says what the number means. Total time is the larger of the Job's and its steps' totals.
- "Current Job" is the learner's last location unless that Job has shipped, otherwise the in-progress Job they touched last.
- One assignment per Job per class (unique index); setting it again changes the due date. Due dates are stored at midday UTC and shown in UTC, so "due 3 Nov" reads the same for teacher and learner.
- On the map, set Jobs are plain lines under the next-Job panel, at most five, and drop off once shipped. Reason: Section 16; no deadline badges or overdue warnings.
- Teachers see saved code (code_files) as read-only text and the latest Take It Home or milestone hand-in for the chosen Job; not snapshots, review cards or self-explanations, which the brief doesn't list.
- Leaving a class, or being removed, ends the teacher's access at once; the learner keeps everything. Deleting a class needs its name typed. Teacher pages are noindex.
- The public profile switch is a synced setting (settings.publicProfile); the address is a column set by a route, so "taken" comes back straight away. Settings flushes sync when the switch changes, so the page appears or goes at once. Role and address are set by routes that insert the profile row if it hasn't synced yet; sync never writes either column.
- /u/<address> is server-rendered from public_profile(), a security definer function that returns nothing unless the learner opted in. It shows the name, the character and the shipped Jobs' Shelf objects by Act; not dates or story notes, though the function returns story flags. noindex: opting in to a page is not opting in to search engines.
- LearnerSprite takes `still` (one frame, no animation loop) for tables of students.

## Engineering
- The Python worker is an ES module worker loaded from /public (not bundled). Reason: Pyodide 314 no longer supports classic workers, and keeping it out of the bundler avoids Turbopack handling Pyodide's wasm and dynamic imports.
- input() blocks the worker on a SharedArrayBuffer (Atomics.wait) while the console collects the answer; Stop sets Pyodide's interrupt buffer and, if Python doesn't stop within 1.5 s, terminates and restarts the worker. Without cross-origin isolation, Stop always restarts the worker and input() explains it can't run.
- Hidden tests are fetched from /api/tests at Check time instead of shipping with the page. Checking runs in the learner's browser, so they can be read with effort; the spec accepts trusted browser checking in the first build (Section 12.4).
- The solution gate (Section 3.5) is enforced on the server: for a signed-in learner it reads their synced hint count, time and status; for a guest, whose work lives only on their own device, it trusts the request: the only person a guest can fool is themselves.
- Learner data timestamps are milliseconds since the epoch (bigint), the same numbers the browser store uses, so sync compares like with like.
- Sync is last-write-wins per row by updatedAt, except code files: if two devices changed the same file, the newer wins and the other is kept as a snapshot marked "From another device", and the editor shows a note.
- Each synced row is upserted in its own savepoint, so one invalid row is rejected without blocking the rest of the outbox.
- Snapshot keys are `job/step/file/time-rand`, so a file's history is one IndexedDB range query.
- Each learner (and the guest) gets their own IndexedDB database; logging out deletes the local copy. Reason: shared computers.
- Content tests run reference solutions in Pyodide under Node in worker threads, with the same interrupt-based timeouts as the browser.
- Content is authored as YAML and Markdown (Section 14) with Zod schemas; tests are Python files using a small custom harness (`output`, `function`, `variable`, `structure`, `custom`), with `set_vars` to re-test fixed programs with other values.
- Misconceptions and story notes may be split across several files (content/misconceptions/*.yaml, content/story/*.yaml) so several authors can work at once.
- Next.js writes an AGENTS.md pointing coding agents at its version-matched docs; it is kept.
- Take It Home: the starter zip is built by the same code in the browser and on the server (`lib/takehome.ts`). Hand-in is by the `ppc` CLI or by uploading pytest's JUnit XML; results are trusted and the server-side sandbox is an interface with a TODO (Section 12.4). Tests that check the learner's own computer are marked `@pytest.mark.local`; content tests run the rest of each suite in Pyodide.
- The `ppc` CLI (cli/) uses only the standard library and is installed with `pip install <site>/ppc.zip`, a source package built on request with that site's address baked in. Sign-in is a device-code flow: the CLI shows a code, the learner approves it at /device, and the CLI receives a token (stored hashed on the server, in a user-only file locally). Tokens can be disconnected in Settings.
- Uploaded projects go to Supabase Storage (private bucket `submissions`) in production and `.data/uploads` locally, under the learner's id, and are deleted with the account.
- `outputFileTracingIncludes` (the content bundle and the CLI sources, read at runtime with computed paths) is set for production builds only: in development Turbopack treats those globs as watched inputs and reloads every page in a loop.
- New tables get explicit grants for `authenticated`: 0001's blanket grant only covers the tables that existed then (0002b also sets default privileges for later ones). RLS still decides which rows.
- The checker's "text repeated" diagnosis only applies when the program read input(), where repeated text comes from.
- Moss's code style review (Section 5.1) is a small AST-based checker in the harness (`review()` in ppc_runtime.py): Ruff can't run in Pyodide. It covers beginner-sized PEP 8 habits (names, shadowed built-ins, `== None`, `== True`, bare `except`, mutable defaults, unused imports, deep nesting, long lines, semicolons), shows at most three notes on the Ship screen, each with Moss's reason, and never stops a Job shipping.
- The weekly note from Moss (Section 16) is opt-in in Settings, three lines, and skipped entirely in a quiet week. It's sent by a weekly cron (vercel.json, protected by CRON_SECRET) through Resend when RESEND_API_KEY is set; locally it lands in /dev/mailbox.
- One-click push to GitHub (Section 8.7) uses the learner's own GitHub account through a GitHub OAuth app (scope public_repo), separate from sign-in, so it works however the learner signed up. The token is encrypted at rest and never reaches the browser. Without the owner's GitHub app the button is hidden and the zip export remains.

## Redesign (REDESIGN.md)
- Name: Fixwick, for the product and the town. Every brand string lives in `lib/brand.ts`; content writes `{{town}}` (`{{TOWN}}`, `{{town_id}}`) and the content compiler fills it in, so a rebrand is one edit. `npm run build` ends with `scripts/brand-check.ts`, which fails if "Saltmarsh" or "Paul's Python Course" survives in the build, the compiled content or public/. The copy lint fails on both names anywhere in content or UI, code included.
- The learner's drawing module is now `workshop` (`from workshop import show_grid`), a story name rather than the brand, so it never changes with a rebrand.
- Palette: one palette for art and interface. `palette.json` gained the UI colours (night-0 to night-4, chalk, fog, lamp, kelp, brick, sea, rust, moss green, plum, the day set) and character ramps; the sprite build's colour cap went from 24 to 64. `tokens.css` is generated from it by `scripts/build-tokens.ts` (`--art-<name>` for the world colours). Components use tokens only; `scripts/style-lint.ts` fails on raw colours, rounded corners, gradients, blurred shadows, backdrop filters, uppercase tracked labels, 1px hairlines and serif fonts.
- Night is the default theme ("night shift at the workshop"); day is the second, and "Follow my device" is an option.
- Type: m6x11plus by Daniel Linssen (free with attribution, credited in CREDITS.md) for game chrome at 18, 36 and 54 px only; Atkinson Hyperlegible Next for reading; JetBrains Mono for code with ligatures off. No serif anywhere; the old Source Serif, IBM Plex and first Atkinson packages are removed.
- Frames are 24x24 9-slice sprites drawn at 2x with `border-image`; the paper's shadow is baked into its sprite. Pixel patterns (dotted paths, stripes, ruled lines) are SVG masks over a token colour, not gradients.
- Icons are drawn in the sprite grids and bundled as SVG paths (`generated/icons.ts`); chalk pixels become `currentColor` so a button can recolour them.
- The Workbench: HUD, step path (with Hint and Dennis), the paper job ticket on the left (foldable), the editor taking the rest (at least 60 per cent at 1440 px), Output and Checks under it at 35 per cent of the height, and the dialogue box across the bottom. Hints open inside the dialogue box (portalled from the step); Dennis is a drawer. The room scene only appears in the Ask and Ship cutscenes.
- Dialogue portraits are 64x64 `portrait-<id>` sheets drawn at 3x and cropped to the box's 128 px, so eyes and mouths are kept in the top 43 rows. Until a character has a portrait, their world sprite stands in.
- Reactive lines come from a cheap `ast` pass inside every Run (`code_events` in ppc_runtime.py: f-strings, names, loops that never run, long functions and lines) plus run and check results, mapped to pools in `lib/reactions.ts`. The last 30 lines shown are never repeated; a cue with nothing fresh says nothing. "First time" cues are remembered per learner.
- Recap on return: after four hours away, Moss and the current client each say one line about where the learner was. Never guilt.
- The Ship demo runs the learner's own program once on the client's "device" with the inputs from the first visible check, then the stamp lands on the ticket and the Shelf object flies to the HUD.
- Payments: a `PaymentsProvider` interface (`lib/payments`) with Paddle Billing as the default (a merchant of record handles sales tax, VAT, invoices and chargebacks for a solo seller), Stripe Billing behind the same interface (`PAYMENTS_PROVIDER=stripe`), and a sandbox provider for development and tests whose checkout and portal are pages on this site and whose webhooks are signed like Paddle's and go through the same handler. Owner action: create the Paddle account and add its keys.
- Webhooks are the source of truth. Each event id is stored (`payment_events`) so a repeat delivery is applied once; an event older than the last one applied to an entitlement is ignored. Past due keeps Pro for 7 days (one calm note in Settings); cancelled keeps it to the end of the paid period.
- Gating is on the server. Pro projects' steps, tests and solutions only leave the server for learners who may open them (`lib/server/gate.ts`); a free learner gets 403s (tested in tests/unit/billing.test.ts). The first project of each Pro Act shows its Ask as a preview. A lapsed learner keeps every project they started, and everything they built stays readable and downloadable.
- Paywalls appear only where the brief allows: the gate scene after the free Act's last project ships, a locked project or district. Never mid-lesson.
- Classroom seats: a teacher buys seats for a class; a learner who joins with the class code takes a seat and has Pro until the seats expire.
- Buying needs the buyer to say they're 18 or over, or under 18 with a parent's or guardian's permission; the answer is kept (`checkout_consents`). "Ask a parent" shares /pricing?for=parent, which explains it plainly for parents.
- Certificates are a Pro feature for Acts II to IX (Act I is free), issued when every main project in the Act has shipped, with a public verification page, a PNG and a one-page PDF drawn on the server in palette pixels (no image or PDF libraries).
- The OG image is drawn by the sprite build from the dusk harbour scene and the wordmark. Favicons come from the 16x16 mark.
- Curriculum: nine Acts of real programs with plain names (content/CURRICULUM.md). Act I's projects got new ids (shop-sign, bill-splitter and so on); the old /job/<id> links redirect. A new Act III (Real-World Python, on the pier) sits between Fluent Python and the Scrapyard; the later Acts kept their ids and were renumbered.
- Every written project has a `project_name`, a `portfolio_readme` (used for the README in Shelf downloads), `downloadable`, and `datasets` with sources and licences; the content build enforces them.

