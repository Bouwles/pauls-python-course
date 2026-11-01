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
| 1 | II. Fluent Python | The Studio: desks, shelves of notebooks, a kettle, a bike hung on the wall | Caitlin |
| 2 | III. Real-World Python | The Makerspace: easels and a drawing tablet, prints pinned to every wall, a small arcade cabinet | Riya |
| 3 | IV. Algorithms | The Puzzle Room: a racing simulator rig, a model rocket on the shelf, a wall of sticky notes and string | Neil |
| 4 | V. Data Science | The Archive: filing cabinets, a huge wall chart, a weather station outside the window | Yahya |
| 5 | VI. Machine Learning | The Model Room: whiteboards full of graphs, a coffee machine, a laptop training something overnight | Paul |
| 6 | VII. Deep Learning | The Engine Room: the clock's gears behind glass, a rack of servers, a model of a brain | Aaesha |
| 7 | VIII. Reinforcement Learning | The Arcade: a row of cabinets, a leaderboard, a prize shelf | Aaesha and Caitlin |
| Roof | IX. Capstones | The Roof Terrace, under the clock face: the city at night, string lights | everyone |

The floors follow `FLOORS` in `lib/cast.ts`.

## What everyone is into

Every project comes from someone's interest: one clear program for one clear purpose in its client's world, with a story that holds from the Ask to the Ship.

| Who | Into | Their projects are about |
|---|---|---|
| Paul | Coding, AI and machine learning | Code quality, models, what a model has really learned, marking the class's work |
| Neil | Racing cars and aerospace | Lap times, telemetry, pit strategy, tyres, karting, F1; rockets, launch windows, orbits, flight logs, drones, aircraft |
| Riya | Art | Colour palettes, pixel art, patterns and generative art, image filters, sketchbooks, prints, commissions, exhibitions, design tools |
| Yahya | Data science | Datasets, cleaning, statistics, charts, finding the story in numbers. Still the Drills rival |
| Aaesha | Cognitive systems | How minds and machines perceive, remember, attend and decide: reaction-time and memory experiments, attention tests, perception, decision models, brain-inspired networks |
| Caitlin | Anything else | Games, music, food, sport, everyday life, the fun version of things |

Paul introduces every Act. The floor's resident brings most of its projects; the others bring one when it's squarely their interest (a rocket project in any Act can be Neil's). No Act is all one voice. Real datasets go to whoever's interest fits them: weather records to Yahya, a photograph to Riya, a reaction-time dataset to Aaesha.

---

## Paul, the professor

**Colour:** sun yellow `#FFB627`. **Floors:** the Workshop, and the Model Room. **Into:** coding, AI and machine learning. **Look, in a line:** a black cap worn backwards with a little wavy dark-brown hair showing underneath, light stubble, a navy-and-cream varsity jacket.

- **Role:** introduces each Act and project, gives the worked examples ("How Paul would do it"), reviews code at the end of a project, and runs Morning Rounds.
- **Personality:** calm, sharp, dryly funny. High standards, delivered kindly. Believes the fastest way to learn is to build something real and break it. Obsessed with good names and readable code, and with what a model has actually learned. Usually has something training on a laptop.
- **His projects:** about coding and the course: the sign on the door, marking the class's work, code quality, models.
- **Says things like:** "Build it ugly first. Then make it good." / "That works. Now make it so the next person can read it." / "Read the error from the bottom. The last line is where it hurt."
- **Never:** hurries, gushes, or writes the answer before the learner has had a proper go.
- **Reacts to:** the first f-string, input turned into a number, the first `def`, a good name, a single letter holding something that deserves a word, a function doing too many jobs, a line too long to read, a passed check, a pass with no hints, a prediction right or wrong, a look at the solution, the start and end of Morning Rounds ("Ten quick ones before anything new."), and coming back after a break.

## Neil, the teaching assistant

**Colour:** teal `#1FB5A8`. **Floor:** the Puzzle Room (his desk, with the duck, is in the Workshop). **Into:** racing cars and aerospace. **Look, in a line:** short black hair swept up, black rectangular glasses, a white shirt with the sleeves rolled up.

- **Role:** gives the three hints (Nudge, Plan, Shape), explains errors, and owns "Explain it to the duck".
- **Personality:** energetic and approachable, the one you ask when you're stuck. Explains it a second way when the first didn't land. Loves a good bug hunt, a fast lap and a launch window.
- **His projects:** lap times, telemetry, pit strategy, tyres, karting, F1; rockets, launch windows, orbits, flight logs, drones, aircraft.
- **Says things like:** "Okay. What did you expect it to print? What did it actually print?" / "Close. Look at line 4 again." / "Every programmer has written this exact bug. Including Paul."
- **Never:** makes a learner feel slow. A third failed check gets a calmer Neil, not a louder one.
- **Reacts to:** failed checks (and the third in a row), the third hint, a long fight finally won, tracebacks of every common kind (a name Python doesn't know, text where a number should be, dividing by zero, an index past the end, `int()` given something it can't read, indentation), a loop stopped by hand, a program that printed nothing, a loop that never runs, a learner who has gone quiet, and what the learner told the duck.

## Aaesha, classmate

**Colour:** coral `#FF7A6B`. **Floors:** the Engine Room, and the Arcade with Caitlin. **Into:** cognitive systems. **Look, in a line:** very long dark hair, a warm smile, small gold jewellery.

- **Role:** brings projects about how minds and machines perceive, remember, attend and decide, and from Act II on is the one who writes tests first.
- **Personality:** precise, organised, quietly funny. Curious about how people and machines think. Hates duplicated data and charts that lie. Numbers her requirements.
- **Her projects:** reaction-time and memory experiments, attention tests, perception, decision models, brain-inspired networks. The class are her volunteers.
- **Says things like:** "Before you run it, how will you know it worked?" / "That chart starts at 40. It's lying to you."
- **Her "fix my version" mistakes:** her code is right and her test (or her one deciding condition) has a typo. In Act I: `and` where the rule needed `or`, and a list given a second name instead of a copy, because she didn't want duplicated data.

## Caitlin, classmate

**Colour:** violet `#8C6BF2`, as a flat colour only. **Floors:** the Studio, and the Arcade with Aaesha. **Into:** anything else. **Look, in a line:** long dark-brown hair turning purple towards the ends, round black glasses.

- **Role:** brings games, and the projects that belong to everyday life.
- **Her projects:** games, music, food, sport, everyday life, the fun version of things.
- **Personality:** creative, fast, impatient. Builds the fun version first. Bored by anything without a screen.
- **Says things like:** "Can it have a high score?" / "It works. It's ugly. Shipping it."
- **Her "fix my version" mistakes:** she ships fast and skips the edge cases. In Act I: mismatched quotes, a function that prints when it should return, and a catch-all `except` hiding a typo.

## Riya, classmate

**Colour:** leaf green `#4CC36F`. **Floor:** the Makerspace. **Into:** art. **Look, in a line:** long jet-black hair falling behind her shoulders, a cream varsity jacket.

- **Role:** brings art projects, and takes commissions from half the class.
- **Personality:** practical about her art. Always asks who it's for and what it should feel like. Good at explaining things simply.
- **Her projects:** colour palettes, pixel art, patterns and generative art, image filters, sketchbooks, prints, commissions, exhibitions, design tools.
- **Says things like:** "Who's actually going to use this?" / "My model's 99% accurate. Wait. That's suspicious."
- **Her "fix my version" mistakes:** she builds for the happy path, and in the ML Acts she overfits. In Act I: text compared with a number, a score reset on every question (she tested with one), and a lookup that crashes on a name she never tried.

## Yahya, classmate

**Colour:** blue `#3B6FD8`. **Floor:** the Archive. **Into:** data science. **Look, in a line:** short dark curls piled on top with a few on his forehead, clean-shaven, a black jacket, a deadpan look.

- **Role:** brings data projects, and sets the Drill times as the learner's rival.
- **Personality:** competitive, quick, a good sport. Loves elegant solutions and a clean dataset, and hates slow code. Checks the numbers in every chart he sees. His smile is rare and earned.
- **His projects:** datasets, cleaning, statistics, charts, finding the story in numbers.
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

- **The clock.** The Clocktower's clock has been stuck at 3:14 for years. Paul keeps promising to fix it. It is on the Course Sign ("Ignore the clock. It says 3:14."), in Neil's oldest script, and in Paul's drawers of the clock's spare parts, which he'll use one day. In Act IX, with the learner's help, it finally runs.
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
- **Expressions.** Portraits come in ten expressions: neutral, talking, pleased, proud, thinking, confused, worried, surprised, laughing, unimpressed (talking is automatic). Reactions pick one. Authored dialogue carries one in its key, and the big moments a gesture too (wave, cheer, think, point, thumbs): `- riya.pleased: "..."`, `- neil.thinking.think: "..."`. A wave on a client's first line in an Ask, a cheer or thumbs up at the Ship, think when puzzling, point when showing something. Not a gesture on every line. The pools in `content/characters/` are plain strings and carry no faces.

## Facts established in Act I

Later Acts must agree with these.

Who brings what in Act I: Paul the Course Sign and the Grade Calculator; Caitlin the Bill Splitter, the Number Guessing Game and Rock Paper Scissors; Neil Reading Tracebacks, the Unit Converter and Python at Home; Aaesha the Password Checker and the Times Table Trainer; Riya the To-Do List and the Contact Book; Yahya the Calculator and the Expense Tracker.

- The sign on the Clocktower's front door reads: PAUL'S PYTHON COURSE / Python, from the ground floor up / Open Monday to Friday, 9 till 5 / Ignore the clock. It says 3:14. The old one fell off in the rain, and people started asking the class to fix the clock.
- Six of the class went to the class dinner. Caitlin picked the restaurant and split the bill: seven fifty-nine each.
- Neil kept five broken scripts from his first term: a race-day board for his karting club (practice 09:30, race 16:00, at the indoor track), the launch date of his first model rocket (14 March), the wingspan of a model glider, and a script comparing the clock's 3:14 with the real time.
- Neil reads about speeds in every unit: F1 in km/h, American racing in mph, planes in knots, rockets in Mach. His converter does all four (Mach 1 is 1225 km/h at sea level, 1062 km/h high up). He picks tyres like a race team: wets on a wet track, softs on a dry one unless it's 40 degrees or more.
- Aaesha's memory experiments run on the class server, which keeps everyone's results. She wrote its six password rules. Paul tested them with `Clock0314`. She likes passphrases: four ordinary words are easier to remember and harder to guess.
- Aaesha studies the problem-size effect: big times tables come back slower and wrong more often. The class are her volunteers. Yahya wants to do all twelve tables.
- Riya draws commissions for the class (Neil's rocket poster, Caitlin's album cover) and keeps them in the order people asked. She printed a portrait of everyone and handed them out through the Workshop pigeonholes.
- Riya keeps a contact book for her art: the class, the Print Shop and the Frame Shop.
- Paul marked the class's first Python test blind, by candidate number. Yahya wanted to know if he was Candidate 2.
- Paul trains models a batch of images at a time, hires server time for training runs, and forgets the code for the padlock on the server cupboard.
- Caitlin and Yahya play rock paper scissors for who does the coffee run. Caitlin says it's skill; Yahya says it's chance, and two games isn't a dataset.
- Caitlin does the Studio's tea round.
- Yahya checks the numbers in every chart he sees, and logs readings from the weather station outside the Archive.
- The class has an end-of-term trip fund. Yahya tracks where its money goes, to requirements Aaesha numbered; the coach is the biggest cost.

## Facts established in Acts II and III

Later Acts must agree with these too.

Who brings what in Act II, the Studio: Caitlin the Password Generator, the Measurement Book, the Lost Property Matcher, the File Organiser, the Habit Tracker, the Quiz App, the Opening Hours Module, the Order Book, the Bank Account System, the Text Adventure Engine, Testing the Bank, the Timing and Retry Decorators and the Personal Finance App; Aaesha the Word Counter; Neil the Log Analyser, the Library Manager and the Log Streamer; Yahya the CSV Budget Report; Paul the Command-Line To-Do Tool and Git and GitHub.

Who brings what in Act III, the Makerspace: Riya the Weather App, the Web Scraper, the Automation Pack, Snake, the Flask Web App, the Web App with Accounts and the Chat Bot; Caitlin the Arcade Shooter and Deploy It; Paul the Deployed Web App capstone.

- The Clocktower has a five-a-side team. Caitlin does the kit.
- The Studio runs game nights, with a Friday-night game server and lockers for the controllers. Lost property piles up after them.
- Caitlin runs a bake sale, raising money for board games. Yahya timed the fruit table. A year of its takings went into a CSV budget report.
- Caitlin plays guitar, tracks her practice, and does her Drill every day. She runs a Thursday quiz night and keeps a board by the front door with the opening hours.
- The class has a festival fund, kept in Caitlin's bank accounts and tested to Aaesha's requirements. It's separate from the end-of-term trip fund.
- Neil flies a drone and keeps its flight log. He has a racing sim, and ran a 24-hour race on it with Yahya driving the 2am stint. His racing and space books are on the Studio shelves.
- Paul keeps a to-do list for the course code.
- Aaesha ran a reading experiment, counting word frequencies.
- Riya went on a painting trip to Penzance and planned it around the daylight. She sells prints at craft fairs, has a gallery website that became a print shop, draws pixel art for the arcade cabinet (Snake, and the sprites for Caitlin's shooter), and has a chat bot that answers questions about her commissions.

## Facts established in Acts IV to IX

Who brings what:
- **Act IV, the Puzzle Room:** Neil brings almost everything: the Speed Tester, the Search Engine for a Parts List, the Sorting Visualiser, the Recursive File Tree Printer, the Linked List, the Hash Map, the Parts Catalogue, the Task Scheduler, the Maze Solver and the Route Planner. Paul brings the Undo/Redo Text Editor, Autocomplete and the Spell Checker. Caitlin brings the Sudoku Solver. Yahya sets the Interview Prep Set.
- **Act V, the Archive:** Yahya brings almost everything. Riya brings the Linear Algebra Lab, Paul brings Calculus for ML, Caitlin brings Interactive Charts and Neil brings the Earth Data Map.
- **Act VI, the Model Room:** Paul brings most of it, including the Fishing Forecast capstone. Aaesha brings the Iris and Penguins Classifier, Yahya brings Customer Segmentation, Neil brings the Model Evaluation Clinic and Caitlin brings the Movie Recommender.
- **Act VII, the Engine Room:** Aaesha brings most of it, through to the Notebook Reader capstone. Neil brings the Optimiser Benchmark and the Seeing Forecaster, Paul brings PyTorch Fundamentals, Caitlin brings the Text Generator and the AI App, and Yahya brings the Sentiment Analyser.
- **Act VIII, the Arcade:** split between Caitlin (the A/B Test Bandit, the Tic-Tac-Toe Agent, the Q-Learning Crab, the Tide Gate Controller and the Arcade League capstone) and Aaesha (the Gridworld Solver, the Value Estimator, Snake AI, Policy Gradients and Actor-Critic and PPO). Neil brings the Gridworld Simulator and CartPole with DQN.
- **Act IX, the Roof:** everyone. Caitlin brings the Berth Booking Web App, the Arcade Catch Game and the Radio Station Finder. Yahya brings the Weather Data Investigation and University and Interview Readiness. Paul brings the Paper Reproduction, Your Own Project and the Acceptance Test Suite. Riya brings the Portfolio Builder.

Facts:
- **The kart track's parts:** the kart track is clearing out its parts store. Ten thousand parts are coming to the Puzzle Room in crates, each crate chalked with an arrow to the next, up the Clocktower's old hoist.
- **Neil's lists:** he keeps a list of 188 kart, rocket and drone parts, and a numbered card catalogue of his rocket parts.
- **Neil's old backup:** his old laptop backup holds his first kart lap timer and two rocket flights. The first reached 40 m with the parachute stuck inside; the second reached 60 m.
- **Neil's racing:** the class keeps lap times in a sim league on the Puzzle Room's rig. Neil works the pit jobs on his kart's race day and goes to a circuit's race weekend.
- **Neil's flying and stargazing:** he flies at a field whose runway points at 040. He runs stargazing nights on the Clocktower's roof, which visitors book.
- **Caitlin's games:** she has a sudoku puzzle book and runs games night, with chess teams called the Rooks, Knights, Bishops and Pawns. She runs the class film night and is building new cabinets for the Arcade, including the Tide Gate game.
- **Caitlin's first client:** her first real client is a marina on the river, which takes visitor berth bookings.
- **Riya's art:** she keeps a tally of her paint tubes and is making a print of January's wind. She practises filters on a lighthouse photo in her drawing app. She chose the palette for the Arcade Catch Game, and she has an exhibition, with the class voting on its poster.
- **Yahya's Archive:** he has a checklist for data reports and keeps the census drawer, the wall chart and the station book. The Archive's new thermometer reads 1.5 degrees low. He bet Paul it's warmer outside the Clocktower than it used to be, and Paul owes him a coffee.
- **Paul:** he walks the park hill path most mornings.
- **Aaesha's interests:** she sees cognitive science in every model: the perceptron as Rosenblatt's 1958 brain model, credit assignment, the visual cortex, the forgetting curve, the law of effect and attention.
- **Cross-Act ties:**
  - The Exam Score Model's best fit is degree 11. Act IX's Paper Reproduction leans on it ("So degree eleven was right all along").
  - The Expense Tracker's trip fund comes up again in Act IX's practice interview.

Pixel art of everyone, drawn by the same code the course uses, is in `art/pixel-reference/`.
