# Writing a Job

How curriculum content is laid out, what each file holds, and how to check it. Read `STYLE.md` and `../CHARACTERS.md` first. The four finished Harbour Front jobs (`acts/01-harbour-front/01-*` to `04-*`) are the quality bar: match their length, voice and structure.

## Commands

```
npm run content          # validate everything and rebuild generated/content (fails on any error)
npm run test:content     # run every reference solution, starter, predict answer and card (must all pass)
npm run test:content -- sign-on-the-door   # only tasks whose name contains this text
npm run lint:copy        # banned phrases, em dashes, emoji, exclamation marks
```

A job is finished only when `npm run content` reports 0 errors and `npm run test:content` passes.

## The town's name

Never type the town's name. Write `{{town}}` and the content compiler puts in the name from `lib/brand.ts`, so a rebrand is one edit. `{{TOWN}}` gives it in capitals (a sign, a headline in a program's output) and `{{town_id}}` gives the lowercase form for file names and Python identifiers. The tokens work in every content file, including starters, solutions, tests and data, so a program's expected output and its tests always agree. The copy lint fails if the old name or the product name appears anywhere.

## Files

```
content/acts/<NN-act>/act.yaml                 the act: title, intro, ordered job ids
content/acts/<NN-act>/<NN-job-id>/job.yaml     the job: client, concepts, the Ask, the Ship, stretch tasks
content/acts/<NN-act>/<NN-job-id>/steps/*.md   one file per step, in order (frontmatter + prose)
content/acts/<NN-act>/<NN-job-id>/starter/<step-id>/<file>    starting code for a checkable step
content/acts/<NN-act>/<NN-job-id>/solutions/<step-id>/<file>  reference solution (never sent to the browser)
content/acts/<NN-act>/<NN-job-id>/tests/<step-id>.py          tests for a checkable step
content/acts/<NN-act>/<NN-job-id>/data/<file>                 data files every run of the job can read
content/concepts/<concept-id>.yaml             one concept: explanation, example, 5+ review cards
content/misconceptions/<anything>.yaml         named misconceptions (one file per author is fine)
content/story/<anything>.yaml                  Penhallow's notes
```

The Ask is always the first step and the Ship always the last; both come from `job.yaml`. The files in `steps/` are everything in between. Outline jobs have `status: outline` and no steps; delete that line when the job is written.

## job.yaml

```yaml
id: bill-splitter               # unique across the course; also the URL
title: "Bill Splitter"          # the plain name of the real program
project_name: "Bill Splitter"   # required; shown first on tickets, the client second (CURRICULUM.md)
portfolio_readme: |             # required for written projects: the README in the learner's download
  # Bill Splitter
  Splits a bill between customers and rounds each share to the penny.
  Written by {name} in {{town}}. Finished {date}.
downloadable: true              # downloads from the Shelf as a runnable folder
datasets:                       # real public data used, each bundled in data/ (also listed in CREDITS.md)
  - name: "Open-Meteo forecast (saved response)"
    source: "https://open-meteo.com/"
    licence: "CC BY 4.0"
    file: "forecast.json"
client: bea                     # a character id from content/characters
building: bakery                # where it sits on the map
estimated_minutes: 30
summary: "The till asks, listens and prices."
concepts_introduced: [input-returns-text, int-conversion]   # each concept is introduced by exactly one job
concepts_reviewed: [variables, arithmetic]                  # must already exist
ask:
  dialogue:                     # two to five short lines
    - bea: "The till from last week works. But it only knows one order."
  spec: |                       # what goes in, what comes out
    Ask for the item (`bread` or `bun`) and the quantity...
  example: |                    # one example run, exactly as a terminal shows it
    Item? bread
    How many? 3
    That's 7.20, please.
ship:
  dialogue:
    - bea: "Seven twenty for three loaves. That's what I'd have said."
  shelf: { object: loaf, label: "Bea's till, the one that asks" }
  cards: [input-returns-text, int-conversion]               # usually = concepts_introduced
stretch:                        # optional extras; never block progress
  - id: any-case
    title: "Bread, BREAD or bread"
    prompt: |
      Customers type `Bread` too. Make the till accept it.
    tests: tests/stretch-any-case.py      # optional; needs solution too
    solution: solutions/stretch-any-case.py   # a file, or a folder for several files (the stretch gets the Make step's files)
story_note: the-hill-is-harder  # optional: a Penhallow note hidden in this job's code
```

Optional flags:

- `sidequest: true`: a Take It Home tooling sidequest (Section 5.1). Unnumbered, shown as "Sidequest" on the map, never an Act's final Job, never suggested as the next Job.
- `scene: lamp-room`: where the scene strip is set. The default is Moss's workshop (with its night version); `lamp-room`, the top of the lighthouse, is for the finale.
- `timed_minutes: 90`: a timed Job (University Readiness). The top bar shows a clock counting the suggested time; nothing is enforced or locked when it runs out.
- `placement_for: <act-id>`: only for placement Jobs, which live in `content/placement/<folder>/` rather than an Act. No `concepts_introduced`, no `ship.shelf`, Make steps without hints. Shipping one marks every Job in that Act as placed and adds the Act's concepts to the review deck.

## Step types

Every step file starts with YAML frontmatter between `---` lines; the markdown after it is the step's prose (150 words at most, and usually far fewer). Common fields: `id` (lower-case-with-hyphens), `type`, `title`, and optional `dialogue` (one-key maps, as in job.yaml).

### predict

The learner commits to an answer before running the code. Every wrong option names a misconception and explains exactly that mistake. The content tests run the code and confirm the correct option, so it must be right.

```yaml
id: predict
type: predict
title: Listening
concept: input-returns-text
code: |
  count = input("How many? ")
  print(count * 2)
inputs: ["3"]                   # used by the content tests (the learner types their own)
question: "If you type `3`, what does this print?"
kind: choice                    # choice (default) or typed
verify: output                  # output (default) | error | crash-line | nth-line | value
options:
  - text: "6"
    misconception: input-returns-number
    feedback: "input() always hands you text. The text \"3\" doubled is \"33\"."
  - text: "33"
    correct: true
    feedback: "Right. input() gives you text, and text times 2 is the text twice."
  - text: An error
    misconception: str-times-int-errors
    error: TypeError            # options that claim a crash name the exception
    feedback: "Text times a whole number is allowed. It repeats the text."
after: |
  Now run it and type `3` yourself.
```

- `verify: output` compares the correct option's text with what the code prints.
- `verify: error` checks the program raises the correct option's `error` (use `error: none` style options without `error` for "it doesn't crash").
- `verify: crash-line` checks the correct option's line number (e.g. "Line 3") is where it crashes.
- `kind: typed` uses `accept: ["33"]` instead of options.

### investigate

Questions about running code. Tasks are `answer` (a short typed answer, compared loosely: case, quotes and a trailing full stop are forgiven) or `run` (the learner changes the code and it is checked with inline tests).

```yaml
type: investigate
code: |
  count = input("How many? ")
  print(count * 2)
tasks:
  - id: type-of-count
    prompt: "Add `print(type(count))` and run it again. What type is `count`?"
    kind: answer
    accept: ["str", "<class 'str'>", "string"]
    feedback: "`str`, short for string: text."
    wrong: "Look at the last line of the output."
  - id: make-it-a-number
    prompt: "Change line 1 so `count` holds a whole number."
    kind: run
    tests: |
      TESTS = [output("Typing 3 gives 6", inputs=["3"], expect=r"^6$", match="regex")]
    solution: |
      count = int(input("How many? "))
      print(count * 2)
```

### worked

Moss's worked example: a similar but not identical problem, split into labelled subgoals (line ranges). The labels are the point; reuse them as comments in the Make starter. Ends with a self-explanation prompt and Moss's model answer.

```yaml
type: worked
code: |
  metres = input("Metres of rope? ")
  metres = float(metres)
inputs: ["2.5"]
subgoals:
  - label: Ask for the text
    lines: [1, 1]
  - label: Turn the text into a number
    lines: [2, 2]
explain:
  prompt: "Why does Moss use `float` here and not `int`?"
  answer: "Rope comes in parts of a metre, like 2.5."
  concept: float-conversion
```

`language: text` shows something other than Python (a traceback, a terminal session) and is not run.

### pips, fix, modify, make (checkable steps)

All four have starter files, tests and a reference solution. `pips` is Pip's buggy attempt (his bugs are real novice mistakes); `fix` is a broken program without Pip; `modify` changes working code; `make` is the step that counts.

```yaml
type: make
files: [main.py]                # default; several files make tabs
entry: main.py
on_pass: { bea: "Three loaves, seven twenty. I checked it twice." }   # one specific line
hints:                          # required for make and modify
  nudge: "What does `input()` give you, and what does multiplication need?"
  plan: [Ask for the text, Turn the text into a number, Choose the price, Show it rounded]
  shape: |
    qty = ___(input("How many? "))
starter_from: make              # optional: start from the learner's code in an earlier step
timeout_ms: 10000               # optional
argv_field: true                # optional: an Arguments box next to Run, for programs that read sys.argv
```

`pips` also takes `dialogue_after` (what Pip says once it works).

### parsons

Shuffled lines to arrange, with indentation. Use it as scaffolding for new control flow. No distractors before Act II.

```yaml
type: parsons
blocks:                         # in the correct order; indent is in levels of four spaces
  - { code: "for i in range(3):", indent: 0 }
  - { code: "print(i)", indent: 1 }
distractors: []                 # later: [{ code: "...", why: "..." }]
check: run                      # run (tests/<step-id>.py) or order
hints: { nudge: "...", plan: ["...", "..."], shape: "..." }
```

### concept

A non-code activity before the code (Section 3.7). Available widgets:

- `pigeonholes`: params `{ items: ["Letter for Bea", ...], ask: 3, negative: false }`. A row of pigeonholes numbered from 0; the learner finds item `ask`. With `negative: true`, holes are also labelled -1, -2 from the right.
- `two-labels`: params `{}`. Two names, one box: `b = a` then `b.append(...)` changes what `a` shows; `b = a.copy()` makes a second box.
- `lamp-loop`: params `{ count: 4 }`. Old Tom's lamp sweeps once per pass of `for i in range(count)`, showing `i` each time.
- `growth`: params `{ max: 1000, show: ["1", "logn", "n", "nlogn", "n2"] }`. Curves of steps against n with a slider; done when the learner drags n past half way.
- `hill-walker`: params `{ start: -2, rate: 0.1 }`. Gradient descent on a one-dimensional loss curve with a learning-rate slider; done once the learner has reached the bottom with a small rate and overshot with a rate above 1.

The step-through visualiser (Step through, in every editor) also draws Living Visualisations from the learner's own code: lists as Mira's pigeonholes, lists of numbers as Nell's piles (bars, so sorting code animates), dictionaries as the post office drawers, recursive calls as Nell's junk tower (one crate per waiting call, with what each gives back), and Old Tom's lamp for loops.

### The `workshop` module: drawings the learner's code sends

For algorithms that run too long to step through, the learner's program calls a drawing function each time round its loop, and the output panel plays the frames back (Play, Pause, Back, Forward, a speed menu). It works in Run only; checks ignore it, and it never changes what is printed, so tests stay the same.

```python
from workshop import show_grid, show_graph, show_hill

show_grid(values, policy=None, crab=None, walls=(), goal=(), q=None, title=None)
show_graph(edges, positions=None, visited=(), frontier=(), path=(), current=None, distances=None, title=None)
show_hill(x, loss, curve=None, title=None)
```

- `show_grid`: Sir Reginald's racing grid (Act VII). `values` is a list of rows (or a 2D NumPy array); tiles are tinted green for positive and brick for negative. `policy` is a grid of moves (`"up"`/`"^"`, `"down"`/`"v"`, `"left"`/`"<"`, `"right"`/`">"`, or 0 to 3 in that order, `None` for none). `q` is a grid of action-value lists, or a dict `{(row, col): [up, down, left, right]}`, shown when the learner points at a tile. `crab`, `walls` and `goal` are `(row, col)` tiles. Call it once per sweep of value iteration or once per training episode.
- `show_graph`: a graph drawn on the town map (Act III graphs). `edges` is a dict of neighbour lists or of `{neighbour: weight}` dicts, or a list of pairs or triples. Nodes named after buildings (`"workshop"`, `"bakery"`, `"post-office"`, `"pub"`, `"harbour-office"`, `"ferry"`, `"lighthouse"`, `"tailor"`, `"library"`, `"town-hall"`, `"greengrocer"`, `"bike-shed"`, `"scrapyard"`, `"records-office"`, `"weather-station"`, `"observatory"`, `"crab-club"`) sit on the building; any other names go in a circle, or at `positions`. Call it once per step of BFS or Dijkstra with `visited`, `frontier` (the queue), `current`, and at the end `path`.
- `show_hill`: the hiker on the observatory hill (Act V). Call it once per step of gradient descent with the current position and loss; pass `curve=loss_function` (a function of one number) at least once and the hill is drawn from it.

At most 400 frames of each kind are kept, spread evenly over the run, and the last is always kept, so a training loop of 10,000 episodes is fine. Mention it in step prose ("add `show_grid(V, policy)` inside your loop and run it"); it's a way to see, never a requirement a test checks.

### reading, explain

In any prose, a fence marked ` ```console ` or ` ```text ` is drawn as terminal output (dark, like the console) rather than code to type; use it for shell sessions and pytest reports. The `code` field is always Python.

`reading` is prose (and optional `code`) with a Done button; `explain` is a self-explanation prompt with `prompt`, `answer`, optional `code` and `concept`. Both appear more as the scaffolding fades in later Acts.

### takehome (Take It Home)

A project the learner runs on their own computer (Section 10.5): PyTorch, Gymnasium, Pygame, web frameworks, real git, tooling. The project lives in `takehome/<step-id>/` (starter files plus a real pytest suite under `tests/`, and a `pytest.ini` with `pythonpath = .` so tests can import the project's modules); the reference goes in `solutions/<step-id>/`.

```yaml
---
id: at-home
type: takehome
title: Python on your own computer
python: "3.10"                  # minimum version, shown in the setup guide
requirements: [flask]           # pip packages for requirements.txt; pytest is always added
min_passed: 5                   # optional; default: every test in the suite
heavy: false                    # true for ML Jobs whose tests can't run in Pyodide
setup: |                        # optional extra setup notes (Markdown)
  Flask runs a small server: stop it with Ctrl+C.
---
```

The page shows a setup guide for Windows, macOS and Linux, a Download button for the starter zip (brief, README, files, requirements.txt, `.ppc.json`), and two ways to hand in: the `ppc` tool (`ppc check` runs pytest and uploads the results and code) or uploading `pytest --junitxml=report.xml`. The step passes when the report has at least `min_passed` passing and none failing. Results are trusted (server-side re-running is a documented stub).

Mark tests that check the learner's own computer (Python version, virtual environment, a subprocess call) with `@pytest.mark.local` and register the marker in pytest.ini. Unless `heavy`, the content tests run the suite in Pyodide with `-m "not local"`: the solution must pass and the starter must fail. A takehome step gates Ship when it's the last gate in the Job.

### milestone (capstones)

A capstone milestone (Act VIII): the learner writes their own test plan, shows the work (a link or a zip), and goes through Moss's checklist; Moss's review lists anything unticked with why it matters.

```yaml
---
id: first-page
type: milestone
title: "Milestone 1: one page, served"
test_plan: true                 # the learner writes at least three planned tests, one per line
evidence: link                  # link (https), zip, or none
checklist:
  - id: runs
    text: "The app starts with one command, and the README says which."
    why: "If Agnes can't start it, she can't use it. One command, written down."
  - id: tested
    text: "Every test in your plan exists and passes."
    why: "A plan that isn't run is a wish list."
---
Prose: the milestone's brief.
```

Checklist items are short and checkable by the learner; `why` is Moss's reason, in his voice. Milestones gate Ship like Take It Home steps.

## Tests (`tests/<step-id>.py`)

Plain Python. `output`, `function`, `variable`, `structure` and `custom` are already imported. Define `TESTS = [...]`, simplest first.

```python
TESTS = [
    output("Three loaves", inputs=["bread", "3"], expect="That's 7.20, please.", visible=True),
    output("No buns", inputs=["bun", "0"], expect="That's 0.00, please.",
           hint="If this is the only one failing, check what happens when the order is zero."),
    output("Bread with a capital B", inputs=["Bread", "2"], expect="That's 4.80, please.", stretch=True),
]
```

- `output(name, inputs=[...], expect="...", match="lines")`: runs the program with scripted input. `match` is `lines` (default: every printed line, trailing spaces ignored), `exact`, `contains`, `last_line`, `regex` or `numbers` (with `tol=`). Prompts from `input()` are ignored unless `include_prompts=True`. Other options: `ignore_case`, `files={"name.txt": "..."}`, `seed=`, `argv=["--flag"]`, `exit_code=0`, `set_vars={"loaves": 5}` (replaces the first top-level `loaves = <literal>`, a number, text, list, tuple, dict or set, so a fixed program can be tested with other values).
- `function(name, call="price", args=("bread", 3), expect=7.2, tol=0.005)`: imports the file as a module (code under `if __name__ == "__main__":` does not run) and calls the function. Also `kwargs=`, `returns_type=float`, `prints="..."`, `inputs=`.
- `variable(name, variable="price", inputs=["2.5"], expect=2.5)`: imports the file and checks a variable.
- `structure(name, requires=["For"], forbids=["While"], defines=["price"], calls=["int"], forbids_calls=["eval"], check=fn, message="...")`: AST checks. Use sparingly, only where the learning goal needs it (e.g. "uses a for loop" in the loops job, "no hard-coded answer").
- `custom(name, fn)`: `fn(ctx)` raises `CheckFailed("message", expected=..., actual=...)` or `AssertionError("message")` to fail. `ctx.run_program(inputs=[...], files={}, seed=None, argv=None)` returns a result with `.output` (what print wrote), `.stderr`, `.lines()`, `.error`, `.exit_code`, `.files_out` (files the program wrote); `ctx.module(inputs=[])` imports the file; `ctx.source` and `ctx.tree` (an `ast` tree) are there too.

Common options on every test: `visible=True` (shown in the brief: two typical cases), `stretch=True` (not required), `hint="..."` (for a learner failing only this one), `timeout=` (seconds).

Hidden tests use different values from the visible ones, and include the edge cases.

Randomness: patch `random` inside a custom check so the program is deterministic:

```python
def fixed_number(ctx):
    import random
    old = random.randint
    random.randint = lambda a, b: 7
    try:
        r = ctx.run_program(inputs=["3", "9", "7"])
    finally:
        random.randint = old
    if "Got it in 3" not in r.output:
        raise CheckFailed("With the number fixed at 7, three guesses should win.", expected="Got it in 3", actual=r.output)

TESTS = [custom("Guessing 3, 9, then 7", fixed_number, visible=True)]
```

Files a learner's program writes when they press Run are kept with the job and are there for the next Run (Section 10.4). Checks always start from the job's own data files plus whatever `files=` gives them, so tests are repeatable; to test saving and loading, chain two `ctx.run_program` calls, passing the first result's `files_out` as the second call's `files`.

## Concepts (`concepts/<id>.yaml`)

```yaml
id: int-conversion
title: int() makes whole numbers
summary: |                      # two to four sentences, in the course voice
  `int()` turns text like `"42"` into the whole number 42...
example: |
  print(int("42") + 1)
misconceptions: [int-rounds, int-reads-decimals]
related: [input-returns-text]
drill: true                     # fluency drills make sense for this concept
cards:                          # at least five, of mixed types; each a tiny task, not a definition
  - type: predict               # typed answer, checked against what the code prints
    prompt: What does this print?
    code: |
      print(int(7.9))
    answer: "7"
  - type: choice
    prompt: What happens?
    code: |
      print(int("2.5"))
    verify: error               # output (default with code) | error | crash-line | none (not about running)
    options:
      - { text: A ValueError, correct: true, error: ValueError }
      - { text: It prints 2, misconception: int-reads-decimals, feedback: "..." }
  - type: fix                   # broken code, tests, a solution
    prompt: "..."
    code: |
      ...
    tests: |
      TESTS = [output("...", inputs=["4"], expect="8")]
    solution: |
      ...
  - type: fill                  # ___ gaps; blanks lists accepted answers per gap
    prompt: "..."
    code: |
      count = ___("15")
      print(count + 5)
    blanks: [["int"]]
    tests: |
      TESTS = [output("Prints 20", expect="20")]
  - type: write                 # write a line or two from a starter
    prompt: "..."
    starter: |
      gulls = 12
    tests: |
      TESTS = [variable("Half", variable="fed", expect=6)]
    solution: |
      gulls = 12
      fed = gulls // 2
```

Any card can carry `files: { "helpers.py": "..." }` for a small module or data file its program uses. Every runnable card is checked by `npm run test:content`.

## Misconceptions (`misconceptions/*.yaml`)

```yaml
range-includes-end:
  concept: range
  description: Thinks range(5) includes 5.
```

## Rules that the build enforces

- No em dashes, emoji or banned phrases anywhere. No exclamation marks in prose; at most one in a job's dialogue.
- Step prose: 150 words is the aim, 175 the hard limit.
- Every wrong predict option names a known misconception.
- Make and Modify steps have all three hints.
- Every concept has at least five cards; a concept is introduced by exactly one job; every referenced concept, character and misconception exists.
- Every reference solution passes its required tests; every starter fails at least one; every predict answer is what the code really does.
