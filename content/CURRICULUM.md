# The curriculum map (REDESIGN.md Section 7)

Nine Acts of real programs with plain names, one Act to each floor of the Clocktower (`FLOORS` in `lib/cast.ts`). Act I is free; the rest is Pro. This file is the working map for writers: which project is which, who it's for, where its content comes from, and which project introduces each concept. Read `AUTHORING.md` and `STYLE.md` first; `../CHARACTERS.md` is the cast.

## The rules for every project (REDESIGN.md 7.1)

- The project is a **real, standard program type with a plain name**. `title` and `project_name` are that plain name ("Bill Splitter"); the client and story give it a reason but never rename it. The ticket shows the name first and the client second.
- The client is one of the cast (`paul`, `neil`, `aaesha`, `caitlin`, `riya`, `yahya`), and the project comes from their interest (`../CHARACTERS.md`, "What everyone is into"): Paul coding, AI and machine learning; Neil racing cars and aerospace; Riya art; Yahya data science; Aaesha cognitive systems; Caitlin anything else. The floor's resident brings most of an Act's projects; the others bring one when it's squarely their interest.
- `portfolio_readme` (Markdown) is what the learner's downloaded folder says about the program: what it does, how to run it, what it shows they can do. `{name}` and `{date}` are filled in at download. End the first paragraph block with a line like "Written by {name} for Riya, at Paul's Python Course. Finished {date}."
- `downloadable: true` unless the project can't run outside the browser (say why in a YAML comment if false).
- `datasets`: every real public dataset the project uses, with `name`, `source` (a URL), `licence` and the bundled `file` in `data/`. Keep bundled copies small and cleaned so they work offline. Record each one in `../CREDITS.md` too. Data that is invented for the story is fine where no real data fits; say so in the brief.
- Every check passes: `npm run test:content -- <job-id>` (reference solutions pass, starters fail where they should). `npm run content` reports 0 errors.
- Concepts: each concept is introduced by exactly one project (`concepts_introduced`); later projects list it in `concepts_reviewed`.
- Old material to reuse lives in the job folders listed below and in `content/archive/act1/` (folders kept for their steps; they are not built). Reuse what fits, rewrite what doesn't.

## Act I: Foundations (the Workshop, Paul's floor), free, about 25 hours

| # | id | Project | Client | From | Introduces |
|---|---|---|---|---|---|
| 1 | shop-sign | Course Sign | paul | was sign-on-the-door | program-order, print, strings, comments |
| 2 | bill-splitter | Bill Splitter | caitlin | was the old till jobs (two of them) | arithmetic, operator-precedence, variables, naming, input-returns-text, int-conversion, float-conversion, f-strings, type-function (and rounding) |
| 3 | reading-tracebacks | Reading Tracebacks | neil | was reading-the-wreckage | reading-tracebacks, syntax-error, name-error, type-error, value-error, str-conversion |
| 4 | unit-converter | Unit Converter | neil | was ferry-fare-machine | bool, comparisons, if-elif-else, nested-conditions |
| 5 | password-checker | Password Checker | aaesha | was harbour-noticeboard | string-methods, string-slicing, immutability, strip-replace, boolean-operators, in-operator |
| 6 | times-table-trainer | Times Table Trainer | aaesha | was the old lamp-check job | for-loops, range, loop-variables, tracing-loops (and nested loops) |
| 7 | number-guessing-game | Number Guessing Game | caitlin | was guess-the-catch, plus archive/act1/the-fog-horn | while-loops, sentinels, running-totals, infinite-loops, random-module, imports, break-continue |
| 8 | to-do-list | To-Do List | riya | was the old pigeonholes job, plus archive/act1/shopping-list-fixer | lists, indexing, negative-indices, append-pop, looping-lists, list-methods, slicing, sorted-vs-sort, list-aliasing |
| 9 | contact-book | Contact Book | riya | was the-address-book | dictionaries, dict-get, dict-items, nested-data, split-join |
| 10 | grade-calculator | Grade Calculator | paul | was pub-quiz-night | functions, parameters, return-values, none, scope |
| 11 | rock-paper-scissors | Rock Paper Scissors | caitlin (with yahya) | new | (reviews functions, random, dictionaries: the first whole game) |
| 12 | calculator | Four-Function Calculator | yahya | new | exceptions, try-except (moved here from Act II) |
| 13 | expense-tracker | Expense Tracker (capstone) | yahya (for the whole class) | was harbour-logbook | none: a menu-driven CLI of lists of dictionaries and functions |
| - | python-at-home | Python at Home (sidequest) | neil | unchanged | terminal-basics, virtual-environments |

What each one is for, in the story: the sign on the Clocktower door (Paul); splitting the bill after the class dinner (Caitlin); five broken racing and rocket scripts from Neil's first term; Neil's speeds from F1, planes and rockets, Mach included; password rules for the server that holds Aaesha's memory experiments; a times tables trainer for Aaesha's problem-size experiment, the class as volunteers; Caitlin's first game; Riya's art commissions, in the order people asked; Riya's contact book of clients, the Print Shop and the Frame Shop; marking the class's first Python test, blind (Paul); settling who does the coffee run (Caitlin, with Yahya calling it chance); a calculator Yahya keeps open for checking numbers; the end-of-term trip fund, where Yahya finds the story in the receipts (Caitlin and Paul in the dialogue).

"Fix my version" in Act I: Caitlin (Course Sign, Grade Calculator, Calculator), Yahya (Bill Splitter, Number Guessing Game, Rock Paper Scissors), Riya (Unit Converter, Times Table Trainer, Contact Book), Aaesha (Password Checker, To-Do List).

The gate scene plays after the Expense Tracker ships (it's the last main project of the free Act).

## Act II: Fluent Python (the Studio, Caitlin's floor), Pro, about 45 hours

1. Password Generator. 2. Word Counter and Text Analyser. 3. File Organiser. 4. Habit Tracker. 5. Quiz App. 6. Bank Account System. 7. Library Manager. 8. Text Adventure Engine. 9. Testing the Bank. 10. CSV Budget Report. 11. Command-Line To-Do Tool. 12. Iterators and Generators (a log streamer). 13. Decorators and Functional Tools. 14. Git and GitHub. 15. Capstone: Personal Finance App.

Map the existing High Street jobs onto these where they fit (for example function-workshop toward Password Generator, library-catalogue toward Word Counter or CSV Budget Report, the logs job (folder 06) toward Habit Tracker, greengrocers-labels toward Quiz App, bike-hire-shed-1 toward Bank Account, bike-hire-shed-2 and postcards toward Library Manager, testing-the-tide-table toward Testing the Bank, recipe-generator toward the log streamer, the-shop-timer toward Decorators, command-line-tools toward the Command-Line To-Do Tool, version-control toward Git and GitHub, high-street-market-app toward Personal Finance App). Projects with no existing job become `status: outline`.

Clients and themes, after the interests re-theme: Password Generator (caitlin): the Friday-night game server and the controller lockers. Measurement Book (caitlin): kit for the Clocktower's five-a-side team. Lost Property Matcher (caitlin): lost property after the Studio's game nights. Word Counter (aaesha): word frequencies for her reading experiment. File Organiser (caitlin): her downloads folder. Log Analyser (neil): his drone's flight log, `data/flight.log`. Habit Tracker (caitlin): guitar practice and her daily Drill. Quiz App (caitlin): Thursday quiz night. Opening Hours Module (caitlin): her board by the front door. Order Book (caitlin): her bake sale, raising money for board games. Bank Account System (caitlin): the class festival fund. Library Manager (neil): his racing and space books. Text Adventure Engine (caitlin). Testing the Bank (caitlin): the festival fund, to Aaesha's requirements. CSV Budget Report (yahya): a year of bake-sale takings. Command-Line To-Do Tool (paul): his to-dos for the course code. Log Streamer (neil): a 24-hour race on his racing sim, `data/race.log`, with Yahya driving the 2am stint. Timing and Retry Decorators (caitlin): the fruit table at her bake sale, timed by Yahya. Git and GitHub (paul). Personal Finance App (caitlin): the fun version of a budget app.

## Act III: Real-World Python (the Makerspace, Riya's floor), Pro, about 40 hours

Weather App, Web Scraper, Automation Pack, Snake, Arcade Shooter, Flask Web App, Web App with Accounts, Deploy It, Chat Bot, Capstone: Deployed Web App. All outlines in `03-pier/` to start; Weather App is written in full (a real call to Open-Meteo, which needs no key, with a saved response bundled so checks never depend on the network).

Clients and themes, after the interests re-theme: Weather App (riya): her painting trip to Penzance, with a daylight board for painting. Web Scraper (riya): a palette scraper. Automation Pack (riya): the paperwork behind her prints. Snake (riya): in her pixel art, for the arcade cabinet. Arcade Shooter (caitlin): Riya's sprites and Caitlin's high-score table. Flask Web App (riya): a gallery website. Web App with Accounts (riya): the gallery becomes a print shop. Deploy It (caitlin): the gallery and print shop online. Chat Bot (riya): answers questions about her commissions. Capstone: Deployed Web App (paul).

## Acts IV to IX

As listed in REDESIGN.md 7.2. The existing jobs in each Act's folder are mapped onto the new project lists where they fit (renamed to the plain project name), the rest are outlines, and the first project of each Act is written in full.

Each Act's projects come from its residents' interests (`CHARACTERS.md`, "What everyone is into"). The client is in brackets.

- IV, the Puzzle Room (Neil: racing cars and aerospace). These cover his kart, rocket and drone parts, the sim league and race weekend:
  - Speed Tester (neil)
  - Search Engine for a Parts List (neil)
  - Sorting Visualiser (neil)
  - Recursive File Tree Printer (neil)
  - Undo/Redo Text Editor (paul)
  - Linked List (neil)
  - Hash Map from Scratch (neil)
  - Parts Catalogue (neil)
  - Autocomplete (paul, outline)
  - Task Scheduler (neil)
  - Maze Solver (neil)
  - Route Planner (neil)
  - Sudoku Solver (caitlin)
  - Spell Checker (paul)
  - Capstone: Interview Prep Set (yahya, outline)
- V, the Archive (Yahya: data science). These cover the census, the weather station and the station book:
  - NumPy Grade Book (yahya)
  - Census Explorer (yahya)
  - Data Cleaning Pipeline (yahya)
  - Census Pivot Tables (yahya)
  - Weather History Dashboard (yahya)
  - Interactive Charts (caitlin, outline)
  - Earth Data Map (neil, outline)
  - Summary Statistics Report (yahya)
  - Statistics Toolkit (yahya)
  - Linear Algebra Lab (riya)
  - Calculus for ML (paul)
  - Capstone: Data Story (yahya)
- VI, the Model Room (Paul: AI and machine learning):
  - House Price Predictor (paul)
  - Exam Score Model (paul)
  - Diabetes Risk Classifier (paul)
  - Iris and Penguins Classifier (aaesha)
  - Loan Approval Tree (paul)
  - Customer Segmentation (yahya)
  - Model Evaluation Clinic (neil, his stargazing nights)
  - Spam Filter (paul, outline)
  - Movie Recommender (caitlin, outline)
  - Capstone: Fishing Forecast (paul)
- VII, the Engine Room (Aaesha: cognitive systems). Each project is read as a model of a mind:
  - Neural Network from Scratch (aaesha)
  - Tiny Autograd Engine (aaesha)
  - Optimiser Benchmark (neil, as a time trial)
  - Handwritten Digit Recogniser (aaesha)
  - PyTorch Fundamentals (paul)
  - Image Classifier (aaesha)
  - Seeing Forecaster (neil)
  - Tide Predictor (aaesha)
  - Text Generator (caitlin)
  - Tiny GPT (aaesha)
  - Sentiment Analyser (yahya, outline)
  - Using Pretrained Models (aaesha, outline)
  - AI App (caitlin, outline)
  - Capstone: Notebook Reader (aaesha)
- VIII, the Arcade (Aaesha and Caitlin):
  - A/B Test Bandit (caitlin)
  - Gridworld Simulator (neil)
  - Gridworld Solver (aaesha)
  - Value Estimator (aaesha)
  - Tic-Tac-Toe Agent (caitlin, outline)
  - Q-Learning Crab (caitlin)
  - Snake AI (aaesha, outline)
  - Tide Gate Controller (caitlin)
  - CartPole with DQN (neil)
  - Policy Gradients (aaesha)
  - Actor-Critic and PPO (aaesha)
  - Capstone: Arcade League (caitlin)
- IX, the Roof Terrace (everyone). The clock runs again:
  - Berth Booking Web App (caitlin)
  - Weather Data Investigation (yahya)
  - Paper Reproduction (paul)
  - Arcade Catch Game (caitlin)
  - Your Own Project (paul)
  - Portfolio Builder (riya, outline)
  - University and Interview Readiness (yahya)
  - Radio Station Finder (caitlin)
  - Acceptance Test Suite (paul)

## To do when the outlines are written

- Act II Habit Tracker: move `json-module` here from the Quiz App, where it is introduced for now.
- Act II File Organiser: `paths` could move here from the Word Counter.
- Act II Postcards was folded into the Library Manager; `/job/postcards` redirects there.

