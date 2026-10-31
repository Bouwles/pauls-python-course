# Characters

The bible for every line of dialogue in Paul's Python Course. Content must follow it. When a line feels generic, it is wrong: make it specific to the person, the room or the program. How everyone looks is in `art/CAST_APPEARANCE.md` and `art/ARTIST_BRIEF.md`; this file is who they are and how they talk.

**These are real people the owner knows.** Write them warmly and respectfully. Nobody is the butt of the joke. Everyone makes mistakes sometimes and everyone is good at something. Never base a personality, a voice or a look on assumptions about anyone's name, background or culture. Don't invent personal details beyond this file and REDESIGN-2.md: no family, health, religion, relationships or money troubles. An invented detail is small, neutral and about the work: a class dinner, a running app, a tutoring session.

## Rules for everyone

- Short lines. Most are under 20 words. Nobody gives speeches.
- At most one exclamation mark per project, across all its dialogue, and only when it is earned.
- No emoji. No em dashes. Commas, full stops and colons.
- No fourth-wall talk. Nobody mentions AI, "your learning journey", levels or progress bars. The Clocktower is real to them.
- No generic praise. Praise is specific: "Your names say what they hold. That's half of good code."
- British spelling, sentence case.
- Dialogue speakers are cast ids only: `paul`, `neil`, `aaesha`, `caitlin`, `riya`, `yahya`, or `narrator`, sparingly.

## The setting: the Clocktower

An old brick clocktower in a city that is never named. Paul has turned it into a code school. The learner is a student in Paul's class, alongside four classmates. Everyone is a human young adult.

Each Act is a floor, and each floor has a resident:

| Floor | Act | Room | Resident |
|---|---|---|---|
| Ground | I. Foundations | The Workshop: Paul's classroom, a big desk, a chalkboard, and Neil's desk with the duck on it | Paul |
| 1 | II. Fluent Python | The Studio: desks, shelves of notebooks, a kettle | Neil |
| 2 | III. Real-World Python | The Makerspace: a soldering bench, a small arcade cabinet, a server under the desk | Caitlin |
| 3 | IV. Algorithms | The Puzzle Room: a wall of sticky notes and string, a chess table | Yahya |
| 4 | V. Data Science | The Archive: filing cabinets, a huge wall chart, a weather station outside the window | Aaesha |
| 5 | VI. Machine Learning | The Model Room: whiteboards full of graphs, a coffee machine | Riya |
| 6 | VII. Deep Learning | The Engine Room: the clock's gears behind glass, a rack of servers | Aaesha and Neil |
| 7 | VIII. Reinforcement Learning | The Arcade: a row of cabinets, a leaderboard, a prize shelf | Yahya and Caitlin |
| Roof | IX. Capstones | The Roof Terrace, under the clock face: the city at night, string lights | everyone |

Paul introduces every Act. The floor's resident brings most of its projects; the others bring the ones that fit them: Riya the practical ones, Caitlin games and the web, Aaesha data and tests, Yahya algorithms and speed. Paul and Neil can be clients too. No Act is all one voice.

---

## Paul, the professor

**Colour:** sun yellow `#FFB627`. **Floor:** the Workshop. **Look, in a line:** a black cap worn backwards with a little wavy dark-brown hair showing underneath, light stubble, a navy-and-cream varsity jacket.

- **Role:** introduces each Act and project, gives the worked examples ("How Paul would do it"), reviews code at the end of a project, and runs Morning Rounds.
- **Personality:** calm, sharp, dryly funny. High standards, delivered kindly. Believes the fastest way to learn is to build something real and break it. Obsessed with good names and readable code.
- **Says things like:** "Build it ugly first. Then make it good." / "That works. Now make it so the next person can read it." / "Read the error from the bottom. The last line is where it hurt."
- **Never:** hurries, gushes, or writes the answer before the learner has had a proper go.
- **Reacts to:** the first f-string, input turned into a number, the first `def`, a good name, a single letter holding something that deserves a word, a function doing too many jobs, a line too long to read, a passed check, a pass with no hints, a prediction right or wrong, a look at the solution, the start and end of Morning Rounds ("Ten quick ones before anything new."), and coming back after a break.

## Neil, the teaching assistant

**Colour:** teal `#1FB5A8`. **Floor:** the Studio. **Look, in a line:** short black hair swept up, black rectangular glasses, a white shirt with the sleeves rolled up.

- **Role:** gives the three hints (Nudge, Plan, Shape), explains errors, and owns "Explain it to the duck".
- **Personality:** energetic and approachable, the one you ask when you're stuck. Explains it a second way when the first didn't land. Loves a good bug hunt.
- **Says things like:** "Okay. What did you expect it to print? What did it actually print?" / "Close. Look at line 4 again." / "Every programmer has written this exact bug. Including Paul."
- **Never:** makes a learner feel slow. A third failed check gets a calmer Neil, not a louder one.
- **Reacts to:** failed checks (and the third in a row), the third hint, a long fight finally won, tracebacks of every common kind (a name Python doesn't know, text where a number should be, dividing by zero, an index past the end, `int()` given something it can't read, indentation), a loop stopped by hand, a program that printed nothing, a loop that never runs, a learner who has gone quiet, and what the learner told the duck.

## Aaesha, classmate

**Colour:** coral `#FF7A6B`. **Floor:** the Archive, and the Engine Room with Neil. **Look, in a line:** very long dark hair, a warm smile, small gold jewellery.

- **Role:** brings data projects, and from Act II on is the one who writes tests first.
- **Personality:** precise, organised, quietly funny. Hates duplicated data and charts that lie. Numbers her requirements.
- **Says things like:** "Before you run it, how will you know it worked?" / "That chart starts at 40. It's lying to you."
- **Her "fix my version" mistakes:** her code is right and her test (or her one deciding condition) has a typo. In Act I: `and` where the rule needed `or`, and a list given a second name instead of a copy, because she didn't want duplicated data.

## Caitlin, classmate

**Colour:** violet `#8C6BF2`, as a flat colour only. **Floor:** the Makerspace, and the Arcade with Yahya. **Look, in a line:** long dark-brown hair turning purple towards the ends, round black glasses.

- **Role:** brings games, web apps and creative projects.
- **Personality:** creative, fast, impatient. Builds the fun version first. Bored by anything without a screen.
- **Says things like:** "Can it have a high score?" / "It works. It's ugly. Shipping it."
- **Her "fix my version" mistakes:** she ships fast and skips the edge cases. In Act I: mismatched quotes, a function that prints when it should return, and a catch-all `except` hiding a typo.

## Riya, classmate

**Colour:** leaf green `#4CC36F`. **Floor:** the Model Room. **Look, in a line:** long jet-black hair falling behind her shoulders, a cream varsity jacket.

- **Role:** brings practical, real-life projects, and leads the machine learning floor.
- **Personality:** practical and entrepreneurial. Always asks what something is for. Good at explaining things simply.
- **Says things like:** "Who's actually going to use this?" / "My model's 99% accurate. Wait. That's suspicious."
- **Her "fix my version" mistakes:** she builds for the happy path, and in the ML Acts she overfits. In Act I: text compared with a number, a score reset on every question (she tested with one), and a lookup that crashes on a name she never tried.

## Yahya, classmate

**Colour:** blue `#3B6FD8`. **Floor:** the Puzzle Room, and the Arcade with Caitlin. **Look, in a line:** short dark curls piled on top with a few on his forehead, clean-shaven, a black jacket, a deadpan look.

- **Role:** brings algorithm puzzles, sets the Drill times as the learner's rival, and runs the Arcade League.
- **Personality:** competitive, quick, a good sport. Loves elegant solutions and hates slow code. His smile is rare and earned.
- **Says things like:** "Mine runs in 0.02 seconds. Yours?" / "That's O(n squared). We can do better."
- **His "fix my version" mistakes:** he optimises before it works. In Act I: one-letter names and a sum squeezed onto one line, a "duplicate" `input()` removed from a loop, and `random.choice` called once to save time.

---

## Fix my version

The "fix my version" step (`type: pips`) rotates between the four classmates. Its title is "Fix Caitlin's version" (or Aaesha's, Riya's, Yahya's), and the first dialogue line is the classmate's. Each mistake fits the person, as above. The tone is always friendly: "Can you look at mine? Something's off." The classmate's `dialogue_after` shows they understood what went wrong.

## The duck

A yellow rubber duck with a chipped beak, on Neil's desk. It has no name and never speaks. Clicking it opens "Explain it to the duck": the learner says what the code should do, what it does, and which line surprised them. Then Neil says one line.

## The learner

A student in Paul's class. They build a human avatar from layered parts (REDESIGN-2.md 7.3). They rarely speak.

## Running threads

Light touches, never the main thing.

- **The clock.** The Clocktower's clock has been stuck at 3:14 for years. Paul keeps promising to fix it. It is on the Course Sign ("Ignore the clock. It says 3:14."), in Neil's oldest script, and in Aaesha's contact book (Clock Repairs, Clock Parts). In Act IX, with the learner's help, it finally runs.
- **Tabs and spaces.** Neil and Paul disagree, good-naturedly. Paul settles it with a coin in Act I's worked example. Python uses four spaces, and Neil eventually admits Paul was right.

## Reactive lines

Characters react to real events in the learner's code. The events come from cheap static checks run inside each Run and from run and check results (`lib/reactions.ts`). Who says what is one table in `lib/cast.ts`; the lines are pools in `content/characters/<id>.yaml`.

| Who | Events |
|---|---|
| Paul | first-fstring, converts-input, first-function, good-name, letter-name, long-function, long-line, check-passed, pass-no-hints, predict-right, predict-wrong, returning, solution-seen, rounds-start, rounds-done |
| Neil | check-failed, third-fail, third-hint, pass-after-many, run-error, error-name, error-text-number, error-zero, error-index, error-int-text, error-indent, stopped-loop, ran-nothing, loop-never-runs, idle, after-explain |
| Yahya | nested-loop, one-left, drill-start, drill-beaten, and pass-first-try (shared with Caitlin) |
| Caitlin | long-no-loop, and pass-first-try (shared with Yahya) |
| The classmate on a "fix my version" step | fixed-by-learner, shorter-than-mine |
| The project's client | waiting, recap |

- A line may name something from the learner's code with `{name}` (in backticks). Recap lines may use `{step}` (the step's title) and `{job}` (the project's name); put `{step}` last, since a title can end in a question mark.
- **Fit the event exactly.** A line fires on a real event, so it has to be true when it does: a first-try line says nothing about hints, an `error-zero` line is about the zero.
- **No repeats.** The last 30 lines shown to each learner are remembered and never repeated. When every line in a pool has been said lately, the character says nothing. Two to four lines per pool.
- **Recap on return.** After a break of four hours or more, Paul says one `returning` line and the current client says where the learner had got to. Never guilt, never a streak, never "we missed you".
- **Expressions.** Portraits come in ten expressions: neutral, talking, pleased, proud, thinking, confused, worried, surprised, laughing, unimpressed. Reactions pick one; authored lines can set `face:`.

## Facts established in Act I

Later Acts must agree with these.

- The sign on the Clocktower's front door reads: PAUL'S PYTHON COURSE / Python, from the ground floor up / Open Monday to Friday, 9 till 5 / Ignore the clock. It says 3:14.
- Six of the class went to the class dinner. Riya split the bill.
- Neil kept five broken scripts from his first term, including a help-desk board for the Studio door and a script comparing the clock's 3:14 with the real time.
- Yahya runs. His app counts kilometres, his training plans want miles, and he does track laps (200 metres indoors, 400 outdoors). He also times his laps.
- The class has shared accounts (a server, a shared drive, the printer). Aaesha wrote the password rules. Paul tested them with `Clock0314`.
- Riya tutors her younger cousin, who stays offstage and unnamed. He had a times tables test on a Friday.
- Neil keeps his to-do list on sticky notes, and does the Studio's tea round.
- Aaesha keeps one contact book for the class, with numbers for Clock Repairs and Clock Parts.
- Paul marked the class's first test blind, by candidate number. Yahya wanted to know if he was Candidate 2.
- Caitlin and Yahya play rock paper scissors for who does the coffee run. Caitlin says it's skill; Yahya says it's chance.
- The class has an end-of-term trip fund. Aaesha keeps its accounts; the coach is the biggest cost.

Pixel references of everyone, drawn from these descriptions, are in `art/pixel-reference/` (a rough guide only; the real art comes from the illustrator).
