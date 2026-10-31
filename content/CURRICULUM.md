# The curriculum map (REDESIGN.md Section 7)

Nine Acts of real programs with plain names, one Act to each floor of the Clocktower. Act I is free; the rest is Pro. This file is the working map for writers: which project is which, who it's for, where its content comes from, and which project introduces each concept. Read `AUTHORING.md` and `STYLE.md` first; `../CHARACTERS.md` is the cast.

## The rules for every project (REDESIGN.md 7.1)

- The project is a **real, standard program type with a plain name**. `title` and `project_name` are that plain name ("Bill Splitter"); the client and story give it a reason but never rename it. The ticket shows the name first and the client second.
- The client is one of the cast (`paul`, `neil`, `aaesha`, `caitlin`, `riya`, `yahya`). The floor's resident brings most of an Act's projects; the others bring the ones that fit them (REDESIGN-2.md 7.5).
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
| 2 | bill-splitter | Bill Splitter | riya | was the old till jobs (two of them) | arithmetic, operator-precedence, variables, naming, input-returns-text, int-conversion, float-conversion, f-strings, type-function (and rounding) |
| 3 | reading-tracebacks | Reading Tracebacks | neil | was reading-the-wreckage | reading-tracebacks, syntax-error, name-error, type-error, value-error, str-conversion |
| 4 | unit-converter | Unit Converter | yahya | was ferry-fare-machine | bool, comparisons, if-elif-else, nested-conditions |
| 5 | password-checker | Password Checker | aaesha | was harbour-noticeboard | string-methods, string-slicing, immutability, strip-replace, boolean-operators, in-operator |
| 6 | times-table-trainer | Times Table Trainer | riya | was the old lamp-check job | for-loops, range, loop-variables, tracing-loops (and nested loops) |
| 7 | number-guessing-game | Number Guessing Game | caitlin | was guess-the-catch, plus archive/act1/the-fog-horn | while-loops, sentinels, running-totals, infinite-loops, random-module, imports, break-continue |
| 8 | to-do-list | To-Do List | neil | was the old pigeonholes job, plus archive/act1/shopping-list-fixer | lists, indexing, negative-indices, append-pop, looping-lists, list-methods, slicing, sorted-vs-sort, list-aliasing |
| 9 | contact-book | Contact Book | aaesha | was the-address-book | dictionaries, dict-get, dict-items, nested-data, split-join |
| 10 | grade-calculator | Grade Calculator | paul | was pub-quiz-night | functions, parameters, return-values, none, scope |
| 11 | rock-paper-scissors | Rock Paper Scissors | caitlin (with yahya) | new | (reviews functions, random, dictionaries: the first whole game) |
| 12 | calculator | Four-Function Calculator | riya | new | exceptions, try-except (moved here from Act II) |
| 13 | expense-tracker | Expense Tracker (capstone) | aaesha (for the whole class) | was harbour-logbook | none: a menu-driven CLI of lists of dictionaries and functions |
| - | python-at-home | Python at Home (sidequest) | neil | unchanged | terminal-basics, virtual-environments |

What each one is for, in the story: the sign on the Clocktower door (Paul); splitting the bill after the class dinner (Riya); five broken scripts from Neil's first term; Yahya's running distances, paces and laps; rules for the class's shared accounts (Aaesha); a quiz for the younger cousin Riya tutors (he stays offstage); Caitlin's first game; Neil's sticky-note jobs; one contact book for the class (Aaesha); marking the class's first test, blind (Paul); settling who does the coffee run (Caitlin and Yahya); Riya's everyday sums; the end-of-term trip fund (Aaesha keeps it, with Riya and Caitlin in the dialogue).

"Fix my version" in Act I: Caitlin (Course Sign, Grade Calculator, Calculator), Yahya (Bill Splitter, Number Guessing Game, Rock Paper Scissors), Riya (Unit Converter, Times Table Trainer, Contact Book), Aaesha (Password Checker, To-Do List).

The gate scene plays after the Expense Tracker ships (it's the last main project of the free Act).

## Act II: Fluent Python (the Studio, Neil's floor), Pro, about 45 hours

1. Password Generator. 2. Word Counter and Text Analyser. 3. File Organiser. 4. Habit Tracker. 5. Quiz App. 6. Bank Account System. 7. Library Manager. 8. Text Adventure Engine. 9. Testing the Bank. 10. CSV Budget Report. 11. Command-Line To-Do Tool. 12. Iterators and Generators (a log streamer). 13. Decorators and Functional Tools. 14. Git and GitHub. 15. Capstone: Personal Finance App.

Map the existing High Street jobs onto these where they fit (for example function-workshop toward Password Generator, library-catalogue toward Word Counter or CSV Budget Report, the logs job (folder 06) toward Habit Tracker, greengrocers-labels toward Quiz App, bike-hire-shed-1 toward Bank Account, bike-hire-shed-2 and postcards toward Library Manager, testing-the-tide-table toward Testing the Bank, recipe-generator toward the log streamer, the-shop-timer toward Decorators, command-line-tools toward the Command-Line To-Do Tool, version-control toward Git and GitHub, high-street-market-app toward Personal Finance App). Projects with no existing job become `status: outline`.

## Act III: Real-World Python (the Makerspace, Caitlin's floor), Pro, about 40 hours

Weather App, Web Scraper, Automation Pack, Snake, Arcade Shooter, Flask Web App, Web App with Accounts, Deploy It, Chat Bot, Capstone: Deployed Web App. All outlines in `03-pier/` to start; Weather App is written in full (a real call to Open-Meteo, which needs no key, with a saved response bundled so checks never depend on the network).

## Acts IV to IX

As listed in REDESIGN.md 7.2. The existing jobs in each Act's folder are mapped onto the new project lists where they fit (renamed to the plain project name), the rest are outlines, and the first project of each Act is written in full.

- IV, the Puzzle Room (Yahya): Speed Tester, Search Engine for a Parts List, Sorting Visualiser, Recursive File Tree Printer, Undo/Redo Text Editor, Hash Map from Scratch, Autocomplete, Task Scheduler, Maze Solver, Route Planner, Sudoku Solver, Spell Checker, Capstone: Interview Prep Set.
- V, the Archive (Aaesha): NumPy Grade Book, Data Cleaning Pipeline, Weather History Dashboard, Interactive Charts, Earth Data Map, Statistics Toolkit, Linear Algebra Lab, Calculus for ML, Capstone: Data Story.
- VI, the Model Room (Riya): House Price Predictor, Exam Score Model, Spam Filter, Diabetes Risk Classifier, Iris and Penguins Classifier, Loan Approval Tree, Movie Recommender, Customer Segmentation, Model Evaluation Clinic, Capstone: End-to-End ML Project.
- VII, the Engine Room (Aaesha and Neil): Neural Network from Scratch, Tiny Autograd Engine, Handwritten Digit Recogniser, PyTorch Fundamentals, Image Classifier, Sentiment Analyser, Tiny GPT, Using Pretrained Models, AI App, Capstone: Deep Learning Project.
- VIII, the Arcade (Yahya and Caitlin): A/B Test Bandit, Gridworld Solver, Tic-Tac-Toe Agent, Q-Learning Crab, Snake AI, CartPole with DQN, Policy Gradients, Actor-Critic and PPO, Capstone: Arcade League.
- IX, the Roof Terrace (everyone): two capstones from a short list (or your own), the Portfolio Builder, and University and Interview Readiness. The clock runs again.

## To do when the outlines are written

- Act II Habit Tracker: move `json-module` here from the Quiz App, where it is introduced for now.
- Act II File Organiser: `paths` could move here from the Word Counter.
- Act II Postcards was folded into the Library Manager; `/job/postcards` redirects there.

