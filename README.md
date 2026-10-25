# Paul's Python Course

A project-based Python school set in Saltmarsh, a small harbour town that runs on an absent engineer's old scripts. Learners take a desk at Moss's repair shop and fix the town one real program at a time, from a first `print` to reinforcement learning. Python runs in the browser (Pyodide); every check is a real test.

The full brief is `pauls-python-course-prompt.md`. Progress and the build plan are in `PLAN.md`; every non-obvious choice is in `DECISIONS.md`.

## Quick start

```
npm install
npm run dev          # http://localhost:3000
```

No accounts or keys are needed for development: without Supabase settings the app runs on a local backend (Postgres in WebAssembly, stored in `.data/`, with built-in email and password sign-in). Sign-in links are shown at `/dev/mailbox`.

A demo learner with half of Act I done: `npm run seed:demo` (with the dev server running), then log in as `demo@fixwick.test` / `demo-harbour-1987`.

## Scripts

| | |
| --- | --- |
| `npm run dev` | Copy Pyodide, build sprites and content, start Next.js |
| `npm run build` / `start` | Production build and server |
| `npm run content` | Validate `/content` and compile it to `generated/content` (fails on any error) |
| `npm run sprites -- --preview` | Build pixel art from `sprites/src`; previews in `sprites/preview` |
| `npm test` | Unit tests (Vitest): harness, scheduler, store, sync with RLS, classes with RLS, git simulator, copy rules |
| `npm run test:content` | Every reference solution passes, every starter fails, every predict answer and review card is confirmed by running it |
| `npm run test:e2e` | Playwright in the installed Chrome: sign-up to restore on another device, input(), Stop, guest merge, review, export, deletion, axe on every page |
| `PPC_SCREENSHOTS=1 npm run test:e2e -- screenshots` | Every screen at 1440 and 390, light and dark, into `tests/screenshots` |
| `npm run lint:copy` | Em dashes, emoji, banned phrases and exclamation marks in UI and content |
| `npm run typecheck` | TypeScript, strict |
| `npm run capture:how` | Re-take the screenshots used on the landing page |

## How it fits together

```
app/                    Next.js routes (App Router) and API route handlers
components/workbench/   The Workbench: editor, console, checks, hints, Dennis, visualiser, step types
components/world/       Sprites, scenes, the map, the learner's character
components/             Landing, map, rounds, drills, shelf, concepts, settings, auth
components/teach/       Teacher pages: classes, the roster, set Jobs, one student's work
components/profile/     The public profile page (/u/<address>)
components/league/      The Crab League (/league); lib/league/ has the course and the races
components/placement/   The placement test (/placement); sections live in content/placement/
lib/python/             Python in the browser: worker protocol, runtime manager, the harness (py/ppc_runtime.py),
                        and the saltmarsh module learners draw Living Visualisations with (py/saltmarsh.py)
public/py-worker.mjs    The Pyodide worker
lib/content/            Content schemas, loader and lint
lib/store/              Local-first store (IndexedDB), sync engine, session
lib/server/             SQL access (PGlite or Postgres), auth, sync, classes, rate limiting
lib/review/             FSRS review deck
lib/gitsim.ts           The workshop's git, for Act II
lib/takehome.ts         Take It Home: the starter zip and pytest reports, shared by the page, the API and the CLI
cli/                    The ppc companion CLI (standard library only), served as <site>/ppc.zip
content/                The curriculum, as YAML and Markdown (see content/AUTHORING.md)
sprites/                Pixel art as text grids (see sprites/README.md)
supabase/migrations/    Schema and row level security
scripts/                Builds, content tests, seed, copy lint, screenshots
tests/                  Unit and end-to-end tests
```

Learner code never runs on the server. Every change is saved to IndexedDB first and synced in the background; the same SQL and RLS policies run locally (PGlite) and in production (Supabase Postgres).

## The ppc tool

Take It Home Jobs (PyTorch, Gymnasium, Pygame, web frameworks, tooling) run on the learner's own computer. Learners install the companion tool from the site itself, then sign in with a code:

```
pip install https://<site>/ppc.zip
ppc login          # shows a code to type at <site>/device
ppc get <job-id>   # the starter project
ppc check          # runs pytest and hands in the results and the code
```

Without it, learners upload pytest's `--junitxml` report on the Job page. Results are trusted for now; server-side re-running is a stub (`lib/server/sandbox.ts`).

## Writing content

Start with `content/AUTHORING.md`, `content/STYLE.md` and `CHARACTERS.md`. A job is done when `npm run content` shows no errors and `npm run test:content` passes.

## Going to production

1. Create a Supabase project. Run the files in `supabase/migrations/` in the SQL editor, in name order. In Storage, create a private bucket called `submissions` (uploaded Take It Home projects).
2. In Supabase Auth: enable email (with magic links), Google and GitHub; add `<your site>/auth/callback` as a redirect URL.
3. Set the environment variables in `.env.example` on the host (Vercel works as is).
4. The site must be served with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (set in `next.config.ts`); interactive `input()` and Stop rely on them.
5. Optional: for the weekly note from Moss, set `RESEND_API_KEY`, `MAIL_FROM` and `CRON_SECRET` (the cron is in `vercel.json`). For pushing the Shelf to GitHub, create a GitHub OAuth app with the callback `<your site>/api/github/callback` and set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Without these, those two features stay hidden and everything else works.

## Decisions the owner still needs to make

See "Owner decisions" in `DECISIONS.md`: pricing (free for now), hosting accounts and keys, the optional AI tutor (off), and the analytics provider (self-hosted events only).
