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

- A lapsed learner's own work is any Pro project with progress on it or code of theirs saved in it, so someone who wrote code but finished no step keeps it too.
- The paper tickets (job ticket, Shelf labels, Morning Rounds slips, district sheet, pricing cards) are drawn in chalk `#ECE6D6`, the brief's own text colour, as the one light object in the dark world. No page or region has a cream or beige background in either theme; day is a pale harbour blue (`#DCE6EC`).
- Lighthouse couldn't be installed here (the npm registry refused the TLS certificate), so the landing page and a Handbook page were measured on the production build with Playwright instead, locally and without network throttling, at 412 and 1440 px: first and largest paint under 90 ms on both, layout shift at most 0.02 (the landing page's was 0.614: the hero now has its 16:9 shape from the first paint and the canvas is sized before it paints), and the landing page fetches about 0.9 MB in its first three seconds instead of 2.6 MB, because on the landing page Python starts loading four seconds after the page, or at the first tap or key press. Run Lighthouse once from a normal machine before launch.

## Redesign 2 (REDESIGN-2.md)
- The name is Paul's Python Course again (short form PPC), from `lib/brand.ts`; the town, its name and `townName` are gone. Content no longer has a `{{town}}` token.
- The mark is a snake curled into a P: the tail curls at the foot of the stem, the body loops round the bowl and the head rests inside it, with an eye and a small red tongue. It's one SVG (`public/brand/mark.svg`, and `Mark` in `components/site/Brand.tsx`). The favicons (16, 32, 180, 512) and the OG image are rendered from it with the real fonts by `scripts/build-brand.mjs` in Chrome, and committed; they're no longer build output.
- Tokens are generated by `scripts/build-tokens.ts` with no palette file. The brief's status colours don't reach 4.5:1 as text on white, so each accent has a text version per theme (`--sun-text`, `--blue-text`, `--pass-text`, `--fail-text`); the bright versions stay for fills.
- Icons are Phosphor in its regular weight, as the brief names. At 20 px that's a 1.25 px stroke rather than the 1.75 px the brief also mentions; regular was the explicit choice and looks right beside the text face. Phosphor has no duck and no crab, so those two are drawn on Phosphor's grid (256 units, 16-unit round strokes) in `components/ui/Icon.tsx`.
- Who says what lives in one table, `lib/cast.ts`: every reaction event maps to Paul (names, readability, introductions), Neil (errors, hints, debugging), Yahya (speed, nested loops, the Drills), Caitlin (twenty lines where a loop would do), or the step's classmate or the project's client. Interface code never names a character.
- Floors are Act numbers: the ground floor is Act I, the roof is Act IX (`FLOORS` in `lib/cast.ts`).
- The learner's avatar is stored in the profile's existing `character` JSON column, so there's no migration; an old animal look reads as the default avatar (`readAvatar` in `lib/avatar.ts`).
- The Penhallow story notes are gone with the old cast; a leftover `story_note` in a job is ignored.
- Screenshots: the same 20 screens as the first redesign's after set, at 1440x900 and 390x844, night and day, rather than every screen four times (the owner asked for 20 after the first redesign).

## Redesign 3 (REDESIGN3_PLAN.md): pixel everything
- **Why:** the owner's call after Redesign 2. The clean interface read as generic, and the pixel cast reference was the look they wanted, so the whole product is now pixel art built on that cast. Body text and the code editor stay crisp for reading.
- **The people are drawn in code:** `lib/pixel/people.ts` draws any person on a 48x52 grid from a look (`lib/pixel/looks.ts`: the six cast looks as the owner picked them, and the learner's avatar from `lib/avatar.ts`). It has ten expressions, a blink, a mouth with three openings and six gestures with real arms and hands.
  - Mouths are small and soft, in the person's own skin and lip tones and set just under the nose. Teeth show only on a grin or a laugh.
  - Closed "happy" eyes are kept for laughing only.
  - Builds are slim and natural, with arms at the sides when idle.
- **No illustrator pipeline:** there are no image files for the cast, avatars or rooms. The Redesign 2 illustrator pipeline (`art/manifest.json`, `art/final/`, `<Art>`) is only used by `/dev/art`, and `art/ARTIST_BRIEF.md` is marked superseded.
- **Talking:** `useSpeech` types a line at about 35 letters a second, pausing at commas and full stops. The mouth opens wide on a and o, a little on other vowels and letters, and shuts on m, b, p, spaces and stops. A click finishes the line. With reduced motion the line appears whole and nobody moves.
  - Dialogue keys carry the face and gesture (`caitlin.pleased.wave`). When content doesn't say, `moodOf` guesses the face from the words.
  - While a line types, its button is named "Name text…" so the visible words are in the name (WCAG 2.5.3).
- **Animations as GIFs:** `scripts/export-cast-animations.ts` writes every feeling (talking and quiet) and every gesture as GIFs, by default to "Paul's Python Course Cast" on the Desktop. `scripts/draw-cast-pixels.ts` remakes the sheets in `art/pixel-reference/`.
- **Type:** the display face was first Tiny5, a pixel face. The owner found it too pixelated and hard to read, so it is now Fredoka, chosen from a sheet of ten in the site's style (`next/font/local`, from `@fontsource/fredoka`). Fredoka's semi-bold is loaded as its normal weight and its bold as bold, so every title and label is semi-bold without each rule saying so. `font-synthesis` stays off. Display text keeps the `--px-1` to `--px-6` scale (16 to 64 px). The pixel art, the stepped edges and the cast stay pixel. Pixelify Sans was ruled out because its "C" closes up and "fi" reads as "A" at small sizes.
- **Surfaces:** all radii are 0. Pixel edges are a stepped two-pixel outline made from four box-shadows, shadows are hard, and there are no gradients, blur or glows. `scripts/style-lint.ts` enforces these rules.
- **Icons** are pixelarticons (MIT) on a 24 grid, with the duck and the crab drawn on the same grid. Phosphor and Bricolage Grotesque are uninstalled.
- **The logo** is a pixel snake-P on a 16 grid (`lib/pixel/mark.ts`), used by the site, the server-drawn images and `scripts/build-brand.tsx`. That script also makes the favicons, `public/brand/mark.svg` and the OG image (the class along the bottom) without a browser.
- **Floors follow the cast's interests:**

  | Act | Room | Who |
  |---|---|---|
  | I | Workshop | Paul |
  | II | Studio | Caitlin |
  | III | Makerspace | Riya (art) |
  | IV | Puzzle Room | Neil (racing cars and aerospace) |
  | V | Archive | Yahya (data science) |
  | VI | Model Room | Paul (AI and ML) |
  | VII | Engine Room | Aaesha (cognitive systems) |
  | VIII | Arcade | Aaesha and Caitlin |
  | IX | Roof | Everyone |

  Every Act's projects were re-themed to fit, keeping ids, step ids, concepts and test shapes. Clients and facts are in `content/CURRICULUM.md` and `CHARACTERS.md`.
- **Two renamed data files:** the Log Analyser and Log Streamer read `data/flight.log` and `data/race.log` instead of `machines.log`. Ids are unchanged, so progress is safe, but saved code that opens the old name will need the new one.
- **The Notebook Reader's weights:** four lines of Paul's notes changed in the re-theme, but `trained.json` was kept so the sample notes read as before. Retraining from the new notes won't reproduce it exactly, though it still beats the bigram.
- **Rooms** are drawn in code too (`lib/pixel/rooms.ts`, `<PixelRoom>`): 160x56 (the roof 160x88), with back and front layers so people sit behind the desk, in three states (locked, open and busy). The Clocktower is a night scene in both themes.
- **Ask and Ship are cutscenes in the client's room:** the client waves, talks with their mouth in time and cheers at the Ship. The coach is a pixel bust with the same talking.
- **Certificates and share cards** use Fredoka, the pixel mark, the floor's residents on the certificate's seal and the client and the learner on the share card, all drawn from the same engine as SVG (`lib/pixel/svg.ts`).
- **Credits:** the sentence "No artwork is AI-generated" was dropped, because the art is now drawn by code. What to say there instead is the owner's call.
- **Performance:** pixel people and rooms draw, and listen to the shared clock, only while on screen (`components/art/useOnScreen.ts`), and a tick re-renders a person only when their frame changes. On the production build, Lighthouse's mobile run of the landing page went from 72 to 92 on performance (total blocking time from 546 ms to 20 ms). The Handbook page scores 90. Accessibility, best practices and SEO are 100 on both.
- **Acceptance:** all checks pass:
  - 1,919 content tests
  - 131 unit tests
  - 33 end-to-end tests, including axe on 28 pages
  - type check, style lint, copy lint and the brand check on the production build
  
  The after screenshots of the 20 screens are in `tests/screenshots/redesign-3/after/`.

## Redesign 3, second round: more of the cast, no bouncing, and teaching that makes sense
- **The owner's three asks:**
  - "The characters look repetitive: make hundreds of new animations and sprites of the same characters."
  - "Stop making the sprites bounce up and down: make them stand properly."
  - "The way you teach is confusing and doesn't make sense."
- **Nothing bounces:**
  - The breathing bob is gone.
  - Gestures have no `lift`. tests/unit/gestures.test.ts fails if one is added, and tests/unit/figures.test.ts fails if a figure's head moves between frames.
  - People stand still and level. Only faces, arms, hands, legs and props move.
- **The engine:**
  - `lib/pixel/kit.ts` is the shared drawing kit: grid, colours, arms, hands, stamps.
  - `lib/pixel/gestures/` is a registry of gestures, each with tags, faces, beats and its own speed:
    - basic.ts: the first six
    - everyday.ts: 73 anyone can make
    - signature.ts: 56 of each person's own, tied to their interests
  - `lib/pixel/props.ts` and `props-interests.ts` hold the things they hold. Effects (steam, sparkles, notes) are in the region "fx" and get no dark outline.
  - There are 22 expressions (12 new), and eyes can look left, right, up and down.
- **Full-body figures:** `lib/pixel/figures.ts` and `<PixelFigure>`. The grid is 31x48, and a standing figure is 44 px tall, so it fits a room at the same scale. There are 26 actions, in front, back and side views.
- **Variety:** `lib/pixel/variety.ts` picks a gesture for each moment from what it's for, who it is and a seed (the line, the step, the visit). It never repeats the last pick.
  - "Talk" mode: hand gestures, often standing still.
  - "Moment" mode: celebrations and rooms, where each person's own moves come up most.
  - A gesture that content names exactly is kept. One of the first six becomes a fitting variant.
  - Rooms re-pick a gesture the desk would hide. The desks were lowered so most gestures show.
- **Where the variety shows:**
  - **Rooms:** residents get up as full-body figures for errands: Paul to the chalkboard, Neil with his rocket, Riya to her easel.
  - **Drills:** the race has full-body runners.
  - **Morning Rounds:** Paul dances when you finish.
  - **Avatar creator:** it shows your full-body figure.
  - **404:** Neil wanders in.
  - **Everywhere else:** gestures differ from visit to visit.
- **The GIFs:** `scripts/export-cast-animations.ts` writes 1,334 GIFs (about 222 a person: feelings, gestures, moves) into "Paul's Python Course Cast" in the project, where the owner keeps the folder. Git ignores it.
- **Teaching:**
  - **The rules:** "How we teach" at the top of content/AUTHORING.md: explain first, then ask; one idea at a time; plain words; ask about the code plainly; the example matches the Build; the story serves the lesson.
  - **A Learn step type (`learn`):** one idea in plain words, with a small example to run and change, then Got it. The content tests run every example, which must run cleanly or stop with exactly the `error` it names.
  - **The rewrite:** all 94 written projects were rewritten to the rules, Act I to Act IX, with a Learn step before every new idea. No step ids, job ids or concepts changed.
  - **Step names:** the step bar uses plain names (The brief, Learn, Quick check, Try it, Example, Fix Caitlin's code, Build it, Ship it) as one small block per step, so 24 steps fit. Every step shows a short "What to do".
- **Performance:** whether a gesture shows over a desk is worked out ahead of time (`scripts/build-room-visibility.ts` writes `lib/pixel/shown.generated.ts`, and tests/unit/shown.test.ts fails when it's stale), so pages never draw to find out.
  - Lighthouse couldn't be reinstalled (the npm registry stalled), so the production build was measured with Playwright at a 4x slower CPU, over the first 8 seconds:
    - landing page, 412 px: 279 ms blocking time
    - landing page, 1440 px: 321 ms
    - Handbook page: 114 ms
    - largest paint under 200 ms on all of them
  - On the landing page, the pixel engine accounts for about 180 ms of the slowed-down load, drawing the six people in the hero.
- **Local test accounts:** made by the agents for screenshots of Pro pages: `act45-teacher@ppc.test`, `act67-teacher@ppc.test` and `act89-teacher@ppc.test`, in the local database only.

## Local, free, no payments
- **The owner's call:** "keep this local, just for me and my friends; remove the pay system, but keep the system where I can make a class and check up on them; don't make it a full-scale project".
- **Removed:**
  - the payment providers (`lib/payments`: Paddle, Stripe and the sandbox), the billing API routes and the pricing, checkout and thanks pages
  - plans and entitlements (`lib/plans.ts`, `lib/usePlan.ts`, `lib/server/entitlements.ts`), and the Billing section in Settings
  - the Pro gate after Act I and the "Get Pro" preview on a project's brief
  - the Pro and Free badges, the pricing section and its questions on the landing page, the Pricing links, the paid classroom seats, and the payment events in the funnel
- **What's open now:**
  - Every Act and project is open to everyone. `lib/server/gate.ts` only checks that a project exists.
  - Floors open by progress alone.
  - Certificates are for anyone who finishes an Act, Act I included.
- **Kept:** classes: a teacher makes a class, shares its code, sets projects and follows each learner (`/teach`).
- **Left alone:** the old payment tables in the database. They're unused, and leaving them saved a migration.
- **Old links:** `/pricing` and anything under it redirect to the front page.
