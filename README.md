# Paul's Python Course

<p align="center"><img src="docs/readme/cast.gif" width="100%" alt="The six people in the course as animated pixel art: Paul writing on a chalkboard, Neil launching a rocket, Aaesha passing a test, Caitlin playing guitar, Riya with a paint palette and Yahya clicking a stopwatch."></p>

Paul teaches Python to friends, and Neil helps out from time to time. This is the game they use for it. All six people in it are real, and they're all in the class.

**[Play it here](https://bouwles.github.io/pauls-python-course/).** There's nothing to sign up for: pick who you are and start.

It's set in an old clocktower that Paul has turned into a code school. You start on the ground floor, printing a sign for the door. Nine floors and 116 projects later you've written a neural network from scratch and a tiny GPT, trained a crab to race, and you're up on the roof building something of your own. All of it takes about 410 hours.

## Pick who you are

<p align="center"><img src="docs/readme/picker.png" width="720" alt="The Who's playing? screen, with a card for each of the six and one for someone else."></p>

You can play as any of the six, or make your own avatar. Everyone learns the same Python, and who you pick changes the story around it. Play as Neil and Neil's projects are your own, the buggy code you fix turns out to be your old code, the class call you Neil, and someone else gives the help Neil would have given.

| | | |
| --- | --- | --- |
| <img src="docs/readme/paul.png" width="72" alt=""> | **Paul** | The professor. Into coding, AI and machine learning. |
| <img src="docs/readme/neil.png" width="72" alt=""> | **Neil** | The teaching assistant. Into racing cars and aerospace. |
| <img src="docs/readme/aaesha.png" width="72" alt=""> | **Aaesha** | Classmate. Into how minds and machines think. |
| <img src="docs/readme/caitlin.png" width="72" alt=""> | **Caitlin** | Classmate. Let's act like I knew what to put here. |
| <img src="docs/readme/riya.png" width="72" alt=""> | **Riya** | Classmate. Into art, colour and pixel art. |
| <img src="docs/readme/yahya.png" width="72" alt=""> | **Yahya** | Classmate. Into data science. |

## Climb the tower

<p align="center"><img src="docs/readme/tower.png" width="640" alt="The Clocktower at night, with lit rooms and their residents on seven floors and dust sheets on the locked floors above."></p>

Each floor is an Act with someone living on it. A locked floor keeps its furniture under dust sheets until you get there. If you already know some Python, a placement test can open the early floors for you.

| Floor | Room | What you learn | Some of what you build |
| --- | --- | --- | --- |
| Roof | The Roof Terrace | Capstones and a portfolio | Paper Reproduction, Your Own Project |
| 7 | The Arcade | Reinforcement learning | Q-Learning Crab, Snake AI, CartPole with DQN |
| 6 | The Engine Room | Deep learning and AI | Neural Network from Scratch, Tiny Autograd Engine, Tiny GPT |
| 5 | The Model Room | Machine learning | Spam Filter, Movie Recommender, Fishing Forecast |
| 4 | The Archive | Data science | Census Explorer, Earth Data Map, Data Story |
| 3 | The Puzzle Room | Algorithms and data structures | Hash Map from Scratch, Maze Solver, Sudoku Solver |
| 2 | The Makerspace | Real-world Python | Snake, Flask Web App, Chat Bot |
| 1 | The Studio | Fluent Python | Quiz App, Bank Account System, Text Adventure Engine |
| Ground | The Workshop | Foundations | Bill Splitter, To-Do List, Rock Paper Scissors |

## How a project goes

Every project starts with someone in the class needing something. Caitlin has picked the restaurant for class dinner, there are six people and one bill, and last time it took twenty minutes to settle who had the extra garlic bread. So you build a bill splitter.

![Caitlin in the Studio asking for a bill splitter, with Paul in the foreground.](docs/readme/brief.png)

You pick up the ideas a step at a time: a short explanation, an example you can run and change, and questions that ask what some code will print before you get to run it.

![A lesson on print() beside the code editor, with the program's output underneath.](docs/readme/lesson.png)

Then somebody's code turns up with a mistake in it. Yahya's tip program says a bill of 20 with a 10 per cent tip comes to 20.10. You find the bug and fix it, and Paul would like a word about the variable called `c`.

![Fixing Yahya's program: the output says 20.10 where it should say 22.00, and Paul complains about the variable name.](docs/readme/fix.png)

After that you write the program yourself and tests check it. If you get stuck there are hints that give away a little more each time, and a rubber duck you can explain the problem to. The duck won't answer.

When the checks pass you ship it, and it goes on your Shelf. You can download everything there as one repository, push it to GitHub, or send a friend a link that runs it in their browser.

![The Shelf, with an example run of each program someone has shipped.](docs/readme/shelf.png)

Python runs in the browser, so there's nothing to install to get going. Some later projects need more than a browser can do, like PyTorch, Gymnasium and Pygame. Those are Take It Home projects: you build them on your own computer, run the tests with a small tool called `ppc`, and paste the result back in.

## Around the projects

**Morning Rounds** brings each idea back a day or two after you first use it, then less often as it sticks.

**Drills** are five quick tasks against the clock. Yahya has set the time to beat on every one.

![The Drills page, with Yahya's time on each card.](docs/readme/drills.png)

**The Arcade League** is a race every week for the crabs you train in Act 8. You upload your policy, it races on the same seeds as everyone else's, and the lowest average number of moves wins. The rest of the class are on the table too.

![A replay of a crab's race on a grid, above a table with the six of them ranked by average moves.](docs/readme/league.png)

**Certificates** are for finishing an Act. You can save yours as a picture or print it on a sheet of A4.

<p align="center"><img src="docs/readme/certificate.png" width="640" alt="A certificate saying Neil completed Act I: Foundations, signed by Paul Nercessian."></p>

## Classes

This is the part that gets used in real life. Paul makes a class, chooses which projects to set and sends everyone a join link. When they've had a go, they send a progress link back, and opening it adds them to the register with their code to read. Neil gets a co-teacher link with the same class on it, and the League table can be shared the same way.

![The class page: a register of four students, showing which of the three set projects each has shipped.](docs/readme/class.png)

## How it works with no server

The live site is plain files on GitHub Pages. There's no database and there are no accounts.

A class lives in its link. Everything about it is compressed into the part of the URL after the `#`, which browsers don't send to a server. Progress reports, League tables, shared projects and certificates all work the same way. Nothing signs those links and test results are taken on trust, which is fine for a class of friends.

Your progress stays in your browser. To move it, you download a save as a file or copy it as a line of text, then load it somewhere else and choose whether to replace or merge.

Python is [Pyodide](https://pyodide.org) in a Web Worker. `input()` and the Stop button need two headers that GitHub Pages won't let you set, so a service worker adds them, and the page reloads once on your first visit.

The League is deterministic. Each week has its own seeds, so your browser works out the same score anyone else's would.

The art is code. Everyone is drawn pixel by pixel from a description of how they look, with 135 gestures to choose from, and each room is built the same way. Every sound is made with Web Audio as it plays.

The course tests itself as well. For every project, the reference solution has to pass its checks and the starter code has to fail them, and every "what does this print?" answer gets confirmed by running it.

## Running it yourself

```
npm install
npm run dev          # http://localhost:3000
```

No keys are needed. Without Supabase settings, the local version runs on Postgres in WebAssembly (stored in `.data/`) with built-in email sign-in, and sign-in links appear at `/dev/mailbox`. It adds optional accounts on top of what's on Pages: classes at `/teach`, public profiles and server-issued certificates.

For a demo learner with half of Act I done, run `npm run seed:demo` with the dev server running, then log in as `demo@ppc.test` / `demo-harbour-1987`.

To host your own copy, fork this repository and set GitHub Pages to deploy from GitHub Actions. `.github/workflows/deploy.yml` builds it on every push to `main`, using the repository's name as the address. To build it by hand, run `npx tsx scripts/build-pages.ts`, which writes `pages-out/`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Copy Pyodide, build tokens and content, start Next.js |
| `npm run build` / `start` | Production build and server |
| `npm run content` | Validate `/content` and compile it to `generated/content` (fails on any error) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:content` | Run every reference solution, starter, predict answer and review card |
| `npm run test:e2e` | Playwright in the installed Chrome, with axe accessibility checks on every page |
| `PPC_SCREENSHOTS=1 npm run test:e2e -- screenshots` | Every screen at 1440 and 390, light and dark, into `tests/screenshots` |
| `npm run lint:copy` / `lint:style` | Rules for the wording and the stylesheets |
| `npm run typecheck` | TypeScript, strict |
| `npx tsx scripts/build-readme-art.ts` | Redraw the cast animation and portraits in this README |

## How it fits together

```
app/                     Next.js routes (App Router) and API route handlers
components/workbench/    The Workbench: editor, console, checks, hints, duck, visualiser, step types
components/clocktower/   The tower and the desk beside it
components/classes/      Classes through links (/class); lib/classes/ has the links and the register
components/league/       The Arcade League (/league); lib/league/ has the course and the races
components/certificates/ Certificates, drawn in the browser from a link or issued by the server
components/share/        A shared project or Shelf, from its link (/share/#...)
components/settings/     Settings and your save; lib/save/ has the save format and merging
components/teach/        Account classes for the local version (/teach)
lib/pixel/               The pixel people, their gestures and the rooms
lib/playas.ts            Who you play as, and who stands in for them
lib/python/              Python in the browser: worker protocol, runtime, the test harness and the
                         module learners draw visualisations with (py/workshop.py)
lib/content/             Content schemas, loader and lint
lib/store/               Local-first store (IndexedDB), sync engine, session
lib/server/              SQL access (PGlite or Postgres), auth, sync, classes, rate limiting
lib/review/              FSRS review deck
lib/gitsim.ts            The workshop's git, for Act II
lib/sw/                  The service worker, including the headers for Pages
cli/                     The ppc companion tool (standard library only), served as <site>/ppc.zip
content/                 The curriculum, as YAML and Markdown (see content/AUTHORING.md)
supabase/migrations/     Schema and row level security for the server version
scripts/                 Builds, content tests, seed, lints
tests/                   Unit and end-to-end tests
```

Learner code never runs on a server. Every change is saved to IndexedDB first, and with an account it syncs in the background.

## The ppc tool

Take It Home projects run on the learner's own computer. Install the tool from the site itself, then run the tests in the project folder:

```
pip install https://bouwles.github.io/pauls-python-course/ppc.zip
ppc test           # prints a line to paste on the project's page
```

With an account on the local version, `ppc login`, `ppc get <job-id>` and `ppc check` fetch the starter project and hand in the results and the code directly.

## Writing content

Start with `content/AUTHORING.md`, `content/STYLE.md` and `CHARACTERS.md`. A project is done when `npm run content` shows no errors and `npm run test:content` passes.

## The server version

Most people won't need this, since the Pages version is the one in use.

1. Create a Supabase project. Run the files in `supabase/migrations/` in the SQL editor, in name order. In Storage, create a private bucket called `submissions` for uploaded Take It Home projects.
2. In Supabase Auth, enable email (with magic links), Google and GitHub, and add `<your site>/auth/callback` as a redirect URL.
3. Set the environment variables in `.env.example` on the host (Vercel works as it is).
4. Serve the site with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (`next.config.ts` sets them).
5. Optional: for the weekly email, set `RESEND_API_KEY`, `MAIL_FROM` and `CRON_SECRET`. For pushing the Shelf to GitHub through an OAuth app, set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`, with the callback `<your site>/api/github/callback`. Without these, those two features stay hidden and the rest works.

Every non-obvious choice is written down in `DECISIONS.md`.

MIT licensed. Made by Paul Nercessian.
