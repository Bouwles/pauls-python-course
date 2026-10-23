# Build: Paul's Python Course

You are building a complete, production-quality web application called **Paul's Python Course**. It takes a person who has never written a line of code and makes them a fluent Python programmer, then carries them through data, machine learning, deep learning and reinforcement learning, to the level expected of a strong first-year Computer Science or AI undergraduate.

Read this entire document before writing any code. It is long on purpose. Every section matters, and later sections depend on earlier ones. When this document and your own instincts disagree, follow this document. When this document is silent, make the choice a thoughtful, opinionated human designer and teacher would make, write that choice down in `DECISIONS.md`, and move on.

---

## 0. How to work on this

1. Start by creating `PLAN.md` that breaks this document into build phases (Section 22 gives the phases). Keep it updated as you go: tick items off, note anything deferred.
2. Create `DECISIONS.md`. Every time you make a non-obvious choice, add one line: the choice and the reason.
3. Build in vertical slices. A slice is finished only when a real user can sign up, do the thing, close the browser, come back on another device and find their work exactly where they left it.
4. Run the app and look at it. Do not claim a screen is done without having rendered it in a browser and checked it at desktop width (1440px) and phone width (390px).
5. Write tests as you go (Section 21). Do not leave testing to the end.
6. Never invent content placeholders like "Lorem ipsum", "Coming soon!", "Feature 1" or "Your journey starts here". If content does not exist yet, the screen should not exist yet.
7. If you hit something that genuinely needs the owner's decision (a paid service, an account key, a legal question), stop, explain the decision in one short paragraph with your recommendation, and continue on everything else that does not depend on it.

---

## 1. What this is, in one paragraph

Paul's Python Course is a project-based Python school disguised as a small harbour town. You arrive in **Saltmarsh**, a slightly run-down coastal town where almost everything is held together with string and old scripts. You take a desk in the back of **Moss's Workshop**, a repair shop run by an old tortoise who fixes things nobody else will touch. Townsfolk walk in with problems. Every problem is a real program you build: a till for the bakery, a tide table for the harbour, a sorting machine for the post office, a weather model for the observatory, and eventually an agent that learns to race crabs. You learn each new idea exactly when a job needs it, you build the thing for real in a real Python editor in the browser, and automated checks tell you honestly whether it works. By the end, the town is fixed and you can code.

The story is a frame, not a costume. It exists to give every project a reason, a person who needs it, and a consequence when it works. It must never slow down the learning.

---

## 2. Who it is for

**Primary learner:** a motivated 15 to 25 year old who wants to become fluent in Python fast, is heading toward Computer Science or AI study, and is willing to put in serious hours. They are impatient with fluff, allergic to being talked down to, and they will quit an app that feels like a children's game or a corporate training module.

**Secondary learners:** adult career changers, and curious beginners of any age 13 and up.

Design for the primary learner. Tone, pace and difficulty should respect them. Assume intelligence, not prior knowledge.

**What "done" looks like for a learner who finishes:**
- Writes idiomatic Python without looking things up constantly.
- Reads other people's code and error messages calmly.
- Structures programs with functions, classes and modules, tests them with pytest, and uses git.
- Understands time complexity and core data structures and algorithms well enough for first-year CS.
- Handles data with NumPy, pandas and matplotlib.
- Has implemented linear regression, logistic regression, k-nearest neighbours, decision trees, k-means, a neural network with backpropagation, a small autograd engine, and a tiny transformer, from scratch, and then used scikit-learn and PyTorch properly.
- Has implemented bandits, value iteration, Q-learning, DQN and REINFORCE, and understands the ideas behind PPO.
- Has a portfolio of around 60 shipped projects, several of which are substantial enough to show a university or employer.

---

## 3. The teaching method (non-negotiable)

This is the core of the product. The art and story are worthless if the teaching is ordinary. Every design and engineering decision should serve these principles. They come from computing education research and cognitive science, and the app should embody them without ever lecturing the learner about them.

### 3.1 Project-based, just-in-time

- The unit of learning is a **Job**: a real program a townsperson needs.
- Concepts are introduced only when the current Job needs them. Never teach a concept "because it comes next in the textbook".
- Every Job ends in a working, runnable artefact the learner built. The learner can open it later, run it, and show it to people.
- Jobs get bigger. Early Jobs take 20 minutes. Mid-course Jobs take an evening. Capstone Jobs take a week or more.

### 3.2 Inside each Job: the Workbench sequence

Each Job is made of a short sequence of **Steps**. Step types are built on PRIMM (Predict, Run, Investigate, Modify, Make), worked examples with subgoal labels, Parsons problems and erroneous examples. A Job uses whichever step types fit; it does not have to use all of them. The usual shape:

1. **The Ask.** The client walks in and explains what they need, in two to five short lines of dialogue. A clear statement of the finished program appears beside it: what it takes in, what it gives back, one example run.
2. **Predict.** The learner sees a short piece of code that uses the new idea and must predict what it will do before running it. They commit to an answer (multiple choice, typed output, or "which line runs third?"). Then they run it. A wrong prediction is the most valuable moment in the lesson: the feedback explains the exact misconception their wrong answer reveals (each wrong option is written to match a known misconception, with its own explanation).
3. **Investigate.** Questions about the running code: trace a variable, change one value and say what happens, find the line responsible for a behaviour. Uses a step-through visualiser (Section 9.4).
4. **Worked example with subgoals.** Moss shows how he would build a similar but not identical piece. The solution is split into labelled subgoals ("get the input", "turn it into a number", "decide which price applies", "show the result"). Labels are the important part: they transfer to new problems. After the example, a self-explanation prompt asks the learner why one specific line is needed.
5. **Pip's Version (erroneous example).** Pip the pigeon tries the task and gets it wrong in a realistic way. The learner finds and fixes the bug. Pip's bugs are always real novice mistakes, never silly ones.
6. **Parsons.** The learner arranges shuffled lines (with indentation) to build part of the solution. Used as scaffolding, especially for new control flow. Adaptive: if the learner struggles, the app merges two blocks or locks one in place. Avoid distractor blocks for complete beginners (research shows they reduce learning efficiency for young novices); introduce one or two distractors later in the course.
7. **Modify.** Change working code to do something new. Small, checkable.
8. **Make.** Build the Job's program from a blank or near-blank file. Automated tests check it. This is the step that counts.
9. **Ship it.** The client uses the program in a short scene. The artefact is saved to the learner's **Shelf** (their portfolio).
10. **Stretch (optional).** One or two extension challenges for learners who want more. These give extra credit but never block progress.

### 3.3 Fading

Scaffolding fades over the course. In Act I, Jobs have most of the step types and the Make step comes with a starter file. By Act III, a Job may be just The Ask, a short reading, and Make from an empty folder with a test suite. By the capstones, the learner gets a brief and writes their own tests. The app should make this progression visible: the Workbench literally gets emptier.

### 3.4 Retrieval and spacing

- Every concept the learner meets becomes a **Card** in their review deck.
- Cards are not flashcards of definitions. They are tiny retrieval tasks: predict this output, fill this blank, fix this line, write this one-liner. Each concept has at least 5 different card variants so the learner cannot memorise one answer.
- Cards are scheduled with a spaced repetition algorithm. Implement FSRS (Free Spaced Repetition Scheduler) if practical; otherwise SM-2 with sensible defaults. Review sessions are short (5 to 10 cards).
- **Morning Rounds:** when the learner opens the app, they are offered a short review before new work. It is framed as Moss asking them to check on old repairs around town ("the bakery till is acting up again"). It is always skippable, never nagging.
- **Interleaving:** review sessions mix concepts. Later Jobs deliberately reuse earlier concepts without announcing them.

### 3.5 Hints that teach, not hints that solve

Each Make and Modify step has three hint levels, delivered by Moss:
1. **Nudge:** a question pointing at the right subgoal ("What type is the thing `input()` gives you?").
2. **Plan:** the subgoal labels for the solution, as an outline.
3. **Shape:** the solution skeleton with key expressions blanked out.

Never show the full solution until the learner has either passed the tests or asked three times and spent a minimum time on the step (configurable, default 8 minutes). Even then, showing the solution marks the step "Seen solution", and a fresh variant of the task is queued for later.

### 3.6 Error messages are a curriculum

- Python tracebacks are shown in full, but with a plain-language explanation underneath, written by a human for each common error type, aware of the specific context (e.g. a `TypeError` mixing `str` and `int` right after `input()` gets the "input always gives you text" explanation).
- There is an explicit Job early in Act I called **Reading the Wreckage** whose entire goal is reading tracebacks.
- Dennis the rubber duck (Section 6) is the debugging companion: the learner can "explain it to Dennis", which opens a structured self-explanation box (what should happen, what actually happens, which line is the first one that surprises you). This alone often solves the bug.

### 3.7 Concept before code

For some ideas (loops, references, recursion, gradient descent, Q-values), introduce the concept with a short non-code activity first: an interactive diagram, a physical analogy scene in the town, or a sorting puzzle. Example: before list indexing, the learner helps the postmistress find letter number 3 in a row of pigeonholes labelled 0 to 9.

### 3.8 Honest feedback

- Tests must be real. A learner's code is run against hidden and visible test cases. Passing means it works.
- Feedback tells the learner which case failed, what was expected, what they produced, and (when possible) a human-written guess at why.
- No fake praise. No "Great job!" for a wrong answer. No confetti for trivial actions. A passed Make step gets one short, specific line from the client.

### 3.9 Pace for fluency

The learner wants fluency fast. Therefore:
- Keep reading short. No step has more than about 150 words of prose before the learner has to do something.
- Typing beats clicking: from Act I Job 6 onward, most practice involves writing code, not choosing options.
- **Drills:** a separate Drill mode offers timed fluency exercises (write a list comprehension that does X, reverse a string, count words) to build speed after understanding. Drills unlock per concept only after the concept has been used in a Make step.
- A suggested pace: about 1 to 2 hours a day gets a learner through Acts I to III in roughly 10 to 14 weeks. Show estimated hours per Job (based on real median completion times once data exists; hand-estimated before that).

---

## 4. The world: Saltmarsh

### 4.1 Setting

Saltmarsh is a small, windy harbour town on a grey-green coast. It is not fantasy and not sci-fi. Think a slightly odd British or Northern European fishing town crossed with a model railway: pebble beach, a lighthouse, a bakery with a bell over the door, a post office, a ferry, an observatory on the hill, a scrapyard, a terrible pub quiz, a crab racing club. It rains a lot. Things are old but loved.

The tone is dry, warm and understated. Funny in the way a good teacher is funny: deadpan, specific, never wacky. Nobody shouts. Nobody says "Awesome!". No pop-culture references, no memes, no "let's dive in".

### 4.2 Why the town needs you

Saltmarsh's machines and systems were all set up decades ago by an engineer called **Ada Penhallow**, who left town and left behind thousands of half-documented Python scripts. They are breaking one by one. Moss can fix hinges and engines but he has never trusted computers. He has taken you on because you can learn to read and write Penhallow's code.

There is a gentle long-running thread: as you fix things, you find notes Penhallow left in code comments, and slowly piece together where she went and what she was building on the hill (the observatory's learning machine, which becomes the ML and RL acts). This thread is light. It rewards attention but never blocks progress. It must be resolved satisfyingly in the final act.

### 4.3 Map

The home screen is a top-down pixel-art map of Saltmarsh (Section 7). Each district is an Act. Districts start dim and closed (shutters down, no lights) and open as the learner progresses. Fixed buildings visibly change: lights come on, signs get repainted, smoke comes from chimneys, people appear in the streets. Progress is shown by the town coming back to life, not by a percentage bar.

Districts in order:
1. **The Harbour Front** (Act I: Python foundations)
2. **The High Street** (Act II: Fluent Python)
3. **The Scrapyard** (Act III: Algorithms and data structures)
4. **The Records Office and the Weather Station** (Act IV: Data and maths for ML)
5. **The Observatory, lower floors** (Act V: Classical machine learning)
6. **The Observatory, upper floors** (Act VI: Deep learning)
7. **The Crab Racing Club and the Sea Wall** (Act VII: Reinforcement learning)
8. **The Lighthouse** (Act VIII: Capstones)

---

## 5. Curriculum: every Act and every Job

This is the full syllabus. Each Job lists: client, what you build, concepts introduced. "Reviewed" concepts are reused without re-teaching. Estimated times are rough first guesses. Write the content for every Job in Acts I and II in full during the build (Section 22). For Acts III to VIII, build the content structure for every Job and write full content for at least the first three Jobs of each Act, then continue in order.

All Jobs in Acts I to V run entirely in the browser (Section 10). Jobs in Act VI and VII that need PyTorch or Gymnasium have a browser version using NumPy, followed by a **Take It Home** version run locally (Section 10.5).

### Act I: The Harbour Front (Python foundations, about 25 hours)

1. **The Sign on the Door.** Client: Moss. Build: a program that prints the workshop's opening hours sign. Concepts: running code, `print`, strings, quotes, comments, what a program is.
2. **Bea's Till, part 1.** Client: Bea Hollis, the baker. Build: price of a fixed order. Concepts: numbers, arithmetic, operator precedence, variables, assignment as "a label on a box", naming.
3. **Bea's Till, part 2.** Build: asks what you want and how many. Concepts: `input`, the input-gives-text trap, `int`, `float`, `str`, f-strings, `type()`.
4. **Reading the Wreckage.** Client: Moss (Penhallow's broken tide script). Build: fix five broken programs. Concepts: SyntaxError, NameError, TypeError, ValueError, reading a traceback bottom-up, Dennis the duck introduced.
5. **The Ferry Fare Machine.** Client: Captain Ferro. Build: fares by age and time of day. Concepts: `bool`, comparisons, `if`/`elif`/`else`, `and`/`or`/`not`, nesting.
6. **Tom's Lamp Check.** Client: Old Tom at the lighthouse. Build: repeat a check message N times, then a countdown. Concepts: `for`, `range`, loop variables, tracing loops.
7. **The Fog Horn.** Client: Old Tom. Build: keep asking for visibility readings until fog clears, report the average. Concepts: `while`, sentinels, running totals, counters, infinite loops and how to stop them.
8. **Guess the Catch.** Client: the fishermen at the pub. Build: number guessing game with limited tries. Concepts: `random`, `import`, combining loops and conditions, `break`, `continue`.
9. **Mira's Pigeonholes.** Client: Mira at the post office. Build: manage a row of parcels. Concepts: lists, indexing from 0, negative indices, `len`, `append`, `pop`, `in`, looping over lists.
10. **The Shopping List Fixer.** Client: Bea. Build: clean and sort an order list. Concepts: list methods, slicing, `sorted` vs `.sort()`, list aliasing (concept before code: two labels on one box).
11. **The Harbour Noticeboard.** Client: the harbour master, Agnes Rook. Build: format notices, censor rude words, centre text. Concepts: string methods, slicing strings, immutability, `split`, `join`, `strip`, `replace`.
12. **Pub Quiz Night.** Client: Gwen at The Drowned Anchor. Build: a quiz with scores. Concepts: functions, parameters, return values, `None`, scope, why functions exist.
13. **The Address Book.** Client: Mira. Build: look up and add addresses. Concepts: dictionaries, keys and values, `.get`, looping over `.items()`, nested data.
14. **Act I Ship: The Harbour Logbook.** Client: Agnes Rook. Build: a menu-driven program to log boats in and out, with summary reports. Concepts reviewed: everything in Act I. First substantial project (2 to 4 hours).

### Act II: The High Street (Fluent Python, about 45 hours)

1. **Tuples at the Tailor's.** Client: Mr Okonjo, tailor. Build: store measurements. Concepts: tuples, unpacking, multiple return values, `enumerate`, `zip`.
2. **The Lost Property Box.** Client: the town hall. Build: deduplicate and compare lost items. Concepts: sets, set operations, membership speed (first hint of complexity).
3. **The Library Catalogue.** Client: Mrs Vance, librarian. Build: save and load the catalogue. Concepts: files, `with`, reading and writing text, CSV module, paths.
4. **Penhallow's Logs.** Client: Moss. Build: parse a messy log file and report errors. Concepts: exceptions, `try`/`except`/`else`/`finally`, raising errors, defensive input handling.
5. **The Greengrocer's Labels.** Client: Sanjay, greengrocer. Build: transform stock lists. Concepts: list, dict and set comprehensions, conditional comprehensions, when not to use them.
6. **Opening Hours, Properly.** Client: High Street traders. Build: a module of reusable helpers imported by other programs. Concepts: modules, `import`, `if __name__ == "__main__"`, the standard library tour (`datetime`, `math`, `collections`, `itertools`).
7. **Function Workshop.** Client: Moss. Build: a configurable label printer. Concepts: default arguments, keyword arguments, `*args`, `**kwargs`, the mutable default trap, docstrings.
8. **The Mutable Mess.** Client: Bea (her stock numbers keep changing on their own). Build: find the aliasing bug in a real program. Concepts: references, mutability, `copy`, `deepcopy`, `is` vs `==`, step-through visualiser used heavily.
9. **The Bike Hire Shed.** Client: Dev and Kat, bike hire. Build: model bikes and rentals. Concepts: classes, `__init__`, attributes, methods, `self`.
10. **The Bike Hire Shed, part 2.** Build: different bike types. Concepts: inheritance, `super()`, composition vs inheritance, `__str__`, `__repr__`, `__eq__`.
11. **Postcards.** Client: Mira. Build: immutable postcard records. Concepts: `dataclasses`, type hints, `Enum`.
12. **Testing the Tide Table.** Client: Agnes Rook. Build: a tide calculator with a test suite. Concepts: `assert`, pytest, test cases, edge cases, writing tests before code.
13. **The Recipe Generator.** Client: Bea. Build: a recipe scaler that streams results. Concepts: iterators, generators, `yield`, lazy evaluation.
14. **The Shop Timer.** Client: Sanjay. Build: time and log functions. Concepts: functions as values, `lambda`, `map`, `filter`, `sorted(key=...)`, closures, decorators.
15. **Command Line Tools.** Client: Moss. Build: a CLI tool for workshop jobs. Concepts: `argparse`, `sys.argv`, exit codes, writing scripts for others.
16. **Version Control at the Workshop.** Client: Moss. Build: track changes to a project. Concepts: git basics (simulated in-browser git with real commands: init, add, commit, log, diff, branch, merge, conflicts). Learner later sets up real git in Take It Home.
17. **Act II Ship: The High Street Market App.** Client: the traders' association. Build: a full stall-booking system with classes, files, tests and a CLI. 6 to 10 hours.

### Act III: The Scrapyard (Algorithms and data structures, about 45 hours)

Client throughout: Nell Brannigan, who runs the scrapyard and keeps everything in enormous piles.

1. **How Long Will It Take?** Concepts: counting operations, Big-O, timing code, comparing growth with interactive plots.
2. **Finding the Bolt.** Concepts: linear search, binary search, `bisect`, sorted data.
3. **Sorting the Piles.** Concepts: selection, insertion, merge sort, quicksort, stability, built-in sort, visualised.
4. **Recursion in the Junk Tower.** Concepts: recursion, base cases, call stack visualisation, recursion vs iteration, memoisation.
5. **Stacks and Queues of Scrap.** Concepts: stacks, queues, `deque`, bracket matching, undo systems.
6. **Linked Chains.** Concepts: linked lists, nodes, building data structures with classes.
7. **The Hash Pile.** Concepts: how dictionaries work, hashing, collisions, building a hash map.
8. **The Family Tree of Parts.** Concepts: trees, binary search trees, traversals.
9. **Heaps for the Priority Pile.** Concepts: heaps, `heapq`, priority queues.
10. **The Road Map.** Concepts: graphs, adjacency lists, BFS, DFS.
11. **The Cheapest Route.** Concepts: weighted graphs, Dijkstra.
12. **Puzzles from the Pub.** Concepts: backtracking (N-queens, sudoku), dynamic programming (coin change, knapsack, edit distance).
13. **Act III Ship: The Scrapyard Route Planner.** Build: a maze and route solver with A* and a visualisation. Plus a short set of interview-style problems.

### Act IV: The Records Office and the Weather Station (Data and maths, about 40 hours)

Clients: Mr Ashby at the Records Office (100 years of town data), and Priya Lund at the Weather Station.

1. **Arrays, Not Lists.** NumPy arrays, vectorisation, shapes, broadcasting. Why it is fast.
2. **The Census Tables.** pandas Series and DataFrames, loading CSV, selecting, filtering.
3. **Cleaning the Records.** Missing data, types, duplicates, string cleaning, dates.
4. **Group By the Parish.** groupby, aggregation, merge, pivot tables.
5. **Drawing the Weather.** matplotlib: line, bar, scatter, histogram, subplots, honest charts.
6. **Averages Lie.** Descriptive statistics, distributions, variance, outliers.
7. **Is It Really Warmer?** Probability, sampling, simulation, hypothesis testing with permutation tests, correlation vs causation.
8. **Vectors and Arrows.** Linear algebra: vectors, dot products, matrices, matrix multiplication, as geometry first.
9. **Slopes on the Hill.** Calculus intuition: derivatives as slopes, partial derivatives, the chain rule, numerical gradients. No symbol pushing for its own sake.
10. **Act IV Ship: The Saltmarsh Weather Report.** Build: a full analysis notebook-style report of a century of weather with charts and conclusions.

### Act V: The Observatory, lower floors (Classical ML, about 45 hours)

Client: Professor Ines Wendt, who inherited Penhallow's observatory and her unfinished learning machine.

1. **Drawing the Best Line.** Linear regression from scratch: loss, mean squared error, closed form, then gradient descent, learning rate (interactive loss landscape).
2. **Many Features.** Multivariate regression with NumPy, feature scaling.
3. **Training and Testing.** Train/test split, overfitting, underfitting, polynomial features, validation curves.
4. **Rain or No Rain.** Logistic regression from scratch, sigmoid, cross-entropy, decision boundaries.
5. **Was It Right?** Accuracy, precision, recall, F1, confusion matrix, ROC and AUC, class imbalance.
6. **Nearest Neighbours.** k-NN from scratch, distance, choosing k.
7. **The Question Tree.** Decision trees from scratch: entropy, Gini, splits, depth.
8. **Forests and Boosting.** Ensembles, random forests, gradient boosting, intuition.
9. **Meet scikit-learn.** The estimator API, pipelines, cross-validation, grid search, reproducing every previous model in a few lines.
10. **Grouping Stars.** Unsupervised learning: k-means from scratch, choosing k.
11. **Squashing Dimensions.** PCA from scratch (via the covariance matrix and eigenvectors), visualising high-dimensional data.
12. **Fair and Honest Models.** Data leakage, bias in data, what a model can and cannot tell you.
13. **Act V Ship: The Fishing Forecast.** Build: an end-to-end ML project predicting good fishing days from the weather and tide data, with a write-up of what worked and what did not.

### Act VI: The Observatory, upper floors (Deep learning, about 60 hours)

1. **One Neuron.** The perceptron from scratch.
2. **A Small Brain.** A two-layer neural network in NumPy, forward pass.
3. **Learning Backwards.** Backpropagation by hand, then in code, checked against numerical gradients.
4. **The Tiny Engine.** Build a small scalar autograd engine (in the style of micrograd): `Value` objects, computation graphs, `.backward()`, visualised graph.
5. **Training Properly.** Mini-batches, SGD, momentum, Adam, initialisation, activation functions.
6. **Penhallow's Handwriting.** Classify handwritten digits (MNIST-sized data, downsampled for browser) with the NumPy network.
7. **Hello, PyTorch.** Take It Home: tensors, autograd, `nn.Module`, training loops, GPU basics. Recreate the digit classifier.
8. **Seeing.** Convolutional networks: convolution by hand, then a CNN in PyTorch.
9. **Regularising.** Dropout, weight decay, batch norm, data augmentation, early stopping.
10. **Sequences.** RNNs and LSTMs, predicting the next tide reading.
11. **Words as Numbers.** Tokenisation, embeddings, a bigram language model trained on the town's old newspaper.
12. **Paying Attention.** Self-attention from scratch, then a tiny transformer that writes Saltmarsh newspaper headlines (character-level, small enough to train in minutes locally).
13. **Act VI Ship: Penhallow's Notebook Reader.** Build: a small model that reads and completes Penhallow's notes, with a write-up. The story thread pays off here partially: her notes describe what she was really building.

### Act VII: The Crab Racing Club and the Sea Wall (Reinforcement learning, about 50 hours)

Clients: the Crab Racing Club committee (very serious people), and the sea wall engineers.

1. **Which Bucket?** Multi-armed bandits: explore vs exploit, epsilon-greedy, UCB, Thompson sampling, with a live chart.
2. **The Racing Grid.** Markov decision processes: states, actions, rewards, transitions, policies, returns, discounting.
3. **Knowing the Track.** Dynamic programming: policy evaluation, value iteration, policy iteration on a gridworld, values drawn on the grid.
4. **Learning by Racing.** Monte Carlo methods and temporal difference learning.
5. **Q-Crab.** Tabular Q-learning and SARSA, the crab learns the track (animated sprite agent, Section 7.6).
6. **The Sea Wall Gate.** Take It Home: Gymnasium environments, CartPole-style balancing of the tide gate.
7. **Deep Q.** DQN: function approximation, replay buffers, target networks.
8. **Learning the Policy Directly.** Policy gradients, REINFORCE, baselines.
9. **Actor and Critic.** Actor-critic, advantage, an overview of PPO and why it is used, reading a real implementation.
10. **Act VII Ship: The Championship.** Build: an RL agent that races crabs on an unseen track, plus an optional league where learners' agents race each other (Section 13.5).

### Act VIII: The Lighthouse (Capstones, open-ended)

The lighthouse is where Penhallow's story ends. The learner picks capstones from a brief list, each with a written brief, milestones and a self-written test plan, and Moss reviews milestones with structured checklists. Capstones include: a full web app with Flask or FastAPI, a data science investigation on a public dataset, a reproduction of a classic ML paper result at small scale, a game with Pygame (Take It Home), a self-chosen project. Plus a **University Readiness** track: a timed problem set covering Acts I to III at the level of a first-year CS course, and a "explain your project" practice that prepares the learner to talk about their work in an interview.

### 5.1 Cross-cutting threads

- **Tooling:** VS Code, terminal basics, virtual environments, pip, git and GitHub, Jupyter. Taught in Take It Home sidequests at sensible points (after Act I, mid Act II, start of Act IV, start of Act VI).
- **Code style:** PEP 8, naming, refactoring. Moss reviews code style briefly on every Ship Job (automated with a linter like Ruff where possible, with human-written explanations for each rule triggered).
- **Reading code:** at least one Job per Act involves reading and understanding a sizeable existing program (Penhallow's scripts), because reading code is a skill of its own.

---

## 6. Characters

Characters are the heart of the fun. They must feel authored: specific, consistent, a little odd, never generic. Each has a voice guide. Write all dialogue in these voices and keep a `CHARACTERS.md` bible in the repo with these specs, which all content must follow.

General rules for every character:
- Short lines. Most dialogue lines are under 20 words. Nobody gives speeches.
- No exclamation marks except in rare, earned moments (maximum one per Job across all dialogue).
- No emoji, ever.
- No em dashes in any dialogue or UI copy. Use commas, full stops or colons.
- Never break the fourth wall about AI, "the app", or "your learning journey".
- Characters never praise the learner generically. Praise, when it happens, is specific and understated ("The till balanced. Bea counted twice.").
- Characters have opinions and small running jokes that pay off over time.

### 6.1 Main cast

**Moss** (tortoise, mentor, owner of the workshop)
- Look: old, broad, dark olive shell with one patched-up crack held with a brass plate. Wears a leather apron and small round glasses pushed up on his head that he never actually uses. Moves slowly.
- Role: the teacher. Gives hints (three levels), worked examples, code reviews.
- Voice: few words, dry, precise. Talks about code like carpentry. Says "Measure twice." Distrusts anything "clever". Has a strong opinion that variable names should be honest.
- Running bits: is always slightly behind on a repair of his own (an old radio) that he finally fixes in the last Act, with the learner's help. Keeps a tin of biscuits that is always empty when the learner gets there.
- Example lines: "Read it from the bottom. The last line is where it hurt." / "Name it for what it holds, not what you hope it holds." / "That works. Now make it so the next person can read it."

**Pip** (pigeon, fellow apprentice, writes the erroneous examples)
- Look: scruffy grey pigeon with an iridescent neck patch that is slightly too bright for the palette (deliberately), a pencil behind one ear, a satchel full of crumpled printouts.
- Role: delivers "Pip's Version" erroneous examples. Occasionally a rival in Drill mode.
- Voice: fast, confident, cheerful, often wrong in specific, believable ways. Never stupid. Learns from his mistakes on screen: by mid-course, his bugs get subtler (off-by-one, mutable defaults, leaky train/test splits), mirroring the learner's own growth.
- Running bits: keeps trying to make every program "faster" before it works. Has a pet theory that every problem is solved by adding another `if`. In the ML act he overfits everything and is crushed when his 100% training accuracy fails on test data.
- Example lines: "Done already. Well. Mostly done." / "I fixed it by adding an if. Then another one." / "Why would range start at zero. Who decided that."

**Dennis** (yellow rubber duck, debugging companion)
- Look: a slightly faded yellow rubber duck with a chip on its beak, sits on the corner of the learner's desk. Has no animation beyond a tiny squeak bounce. Never speaks.
- Role: the rubber-duck debugging tool. Clicking Dennis opens the "explain it to Dennis" panel. Dennis's silence is the point. After the learner writes their explanation, one line of narration says what Dennis does ("Dennis waits." / "Dennis does not look convinced.").
- Running bit: appears in unexpected places around the town map (on the lighthouse rail, in the bakery window). Finding all twelve hidden Dennises is a quiet collectible with no reward but a note from Moss at the end.

**Ada Penhallow** (absent engineer, never seen until the end)
- Present only through code comments, notes and old photos. Her comments in legacy code are witty, precise and occasionally sad. They teach good commenting by example.
- Revealed at the end of Act VIII. Her sprite should be the most detailed in the game.

### 6.2 Clients

Each client has a look, a voice line style, and a reaction when their Job is shipped. Each appears in at least two Jobs so the learner builds a relationship.

- **Bea Hollis**, baker. Round, flour on her sleeves, very practical, slightly suspicious of computers. Counts everything twice. Voice: brisk, warm. "I don't need it fancy. I need it right on a Saturday."
- **Captain Ferro**, ferry captain. Tall, weathered, enormous beard, speaks in nautical terms he expects you to understand. "Fares, by the tide. Not by guesswork."
- **Old Tom**, lighthouse keeper. Very old, very calm, tells you the same story about the 1987 storm every time. Loves routine and loops, naturally.
- **Mira**, postmistress. Neat, organised, fond of labels and numbered things. The natural owner of lists and dictionaries.
- **Agnes Rook**, harbour master. Crisp, efficient, clipboard. Writes the specifications that read most like real software requirements.
- **Gwen**, landlady of The Drowned Anchor pub, runs the worst pub quiz in the county and knows it.
- **Mr Okonjo**, tailor. Precise to the millimetre. Polite, formal, quietly funny.
- **Mrs Vance**, librarian. Fierce about order. Hates duplicate records more than anything.
- **Sanjay**, greengrocer. Chatty, optimistic, terrible at maths, great at people.
- **Dev and Kat**, siblings who run bike hire and argue constantly about how to model things (a natural way to debate inheritance vs composition).
- **Nell Brannigan**, scrapyard owner. Big gloves, big laugh, knows where everything is in her piles but cannot explain how, which is the point of the algorithms act.
- **Mr Ashby**, Records Office clerk. Quiet, dusty, secretly delighted when someone finally asks about his data.
- **Priya Lund**, Weather Station. Scientist, careful with claims, teaches honest charts by objecting to dishonest ones.
- **Professor Ines Wendt**, observatory. Curious, slightly chaotic, enthusiastic but rigorous. Corrects herself mid-sentence.
- **The Crab Racing Club committee**: three identical-looking old men in matching blazers who take crab racing far too seriously. Their crab, **Sir Reginald**, is the RL agent sprite.

### 6.3 Character use rules in the UI

- Characters appear in a dialogue strip at the top or side of the Workbench, never in a modal that blocks code.
- Dialogue can be skipped and replayed. There is a "Less talk" setting that reduces dialogue to one line per Job.
- Characters react to real events: a failed test, a passed test, a long idle time, the third hint. Reactions are pulled from a small pool of lines per character per event so they do not repeat often (track recently used lines per user).
- Characters never comment on time of day, streaks, or absence in a guilt-tripping way. If the learner returns after a long break, Moss says one neutral line ("You're back. The kettle's still warm.") and offers a short review.

---

## 7. Art direction and sprites

The whole visual identity must look made by a person with taste, not generated. This section is detailed on purpose.

### 7.1 The look in one sentence

A quiet, rainy, slightly melancholy pixel-art harbour town with a tight muted palette, set inside a clean, typographic, almost printed interface, like a well-designed field guide that happens to have a little animated world in it.

Two layers, deliberately contrasting:
1. **The world** (map, characters, scenes): pixel art.
2. **The tool** (editor, lessons, tests, settings): flat, typographic, off-white paper, black ink, one accent colour. No pixel fonts in the tool UI except for tiny character name labels.

### 7.2 Palette

- **World palette:** fixed at 24 colours maximum, defined once in `palette.json`, used for every sprite. Muted coastal colours: slate blues, sea greens, wet stone greys, rust, ochre, brick red, dull lamp yellow, plus a near-black and a warm off-white. No pure black (#000), no pure white (#FFF), no saturated neon, no purple-to-pink gradients. Pip's neck patch is the only intentionally out-of-palette colour.
- **Tool palette:** paper `#F4F1EA` (or similar warm off-white), ink `#1E1E1C`, a mid grey for secondary text, a hairline rule colour, and exactly one accent: a lighthouse-lamp amber (around `#C8811E`) used for the primary action and focus states. Pass and fail use a muted green and a brick red from the world palette, always paired with an icon or text so colour is never the only signal.
- **Dark mode:** night in Saltmarsh. The tool becomes deep ink-blue paper with off-white text, and the map shows the town at night with lit windows. This must be designed, not auto-inverted.

### 7.3 Sprite specification

- **Base grid:** characters are drawn on a 32x32 pixel canvas (Moss is 40x32 because of the shell; Dennis is 12x12). Town tiles are 16x16. Portraits for dialogue are 64x64.
- **Rendering:** sprites are scaled by whole-number factors only (2x, 3x, 4x) with `image-rendering: pixelated`. Never scale by fractional amounts. Never blur. Never smooth.
- **Outlines:** characters use a 1px dark outline that is a darker shade of the adjacent colour (selective outlining), not pure black.
- **Lighting:** single consistent light source from top-left in all sprites. Two to three shades per material maximum.
- **No anti-aliasing tools, no gradients, no dithering except deliberate, sparing dithering in sky and water.**
- **Animation:** low frame counts, deliberately. Idle: 2 to 4 frames at about 4 fps (Moss blinks every few seconds, Pip bobs his head, Old Tom's pipe smoke drifts). Talk: 2 frames. Reaction poses: 1 frame each (Moss nodding, Moss squinting at your code, Pip proud, Pip crestfallen, clients happy, clients puzzled). Walk cycles only for the map: 4 frames.
- **Format:** each character is a single PNG sprite sheet plus a JSON file describing frames, durations and anchors. Load via a small sprite component.
- **How the sprites get made:** Do not use AI image generation for sprites. Create them as pixel data in code: write each sprite as a small text-based pixel map (a grid of palette indices, one character per pixel) in `sprites/src/*.txt` or as JSON arrays, and write a build script (`scripts/build-sprites.ts`) that converts these grids into PNG sprite sheets using the palette. This keeps every pixel intentional, reviewable in git and editable by hand. Draw each character carefully: silhouette first, readable at 1x, recognisable by shape alone. Iterate by rendering the sheet and actually looking at it. Leave a `sprites/README.md` explaining how the owner can edit a sprite by changing characters in the text grid, or replace a sheet with a hand-drawn PNG from Aseprite.
- **Optional licensed art:** if any external pixel art is used (tiles, props), it must be CC0, the source and licence recorded in `CREDITS.md`, and it must be recoloured to the world palette so it matches.

### 7.4 Sprite list for the first build

Characters (with listed frames): Moss (idle x4, talk x2, nod, squint, point, holding radio), Pip (idle x4, talk x2, proud, crestfallen, confused, typing), Dennis (idle, squeak x2), Bea, Captain Ferro, Old Tom, Mira, Agnes Rook, Gwen (each: idle x2, talk x2, happy, puzzled), the learner's own character (see 7.5).

Town: workshop exterior and interior, harbour front tiles (cobbles, water x3 animated, pier boards, bollards, crates, nets, rope), bakery, ferry and ferry dock, lighthouse, post office, pub, harbour master's hut, lamp posts (on and off states), shuttered and open shopfronts, gulls (2-frame flap), rain overlay.

### 7.5 The learner's character

- At sign-up, the learner makes their character: choose a species (a small set of animals that fit the town: otter, hare, badger, fox, heron, mole, seal, frog), one of six coat colours from the palette, one of six jumper colours, and an accessory (scarf, beanie, glasses, flat cap, headphones, none).
- This is built by layering palette-indexed sprite parts, not separate drawings for every combination.
- The character sits at their desk in the workshop on the Workbench screen, and walks around the map.
- Over the course, the learner earns a few cosmetic items through real milestones only (a brass name plate after Act I, a lighthouse keeper's coat after the final capstone). No shop, no currency, no loot boxes.

### 7.6 Sprites inside the lessons

The characters are not only decoration. Use the sprite world to visualise real programs:
- **Loops:** Old Tom's lamp sweeps once per loop iteration while the code runs in the visualiser.
- **Lists:** Mira's pigeonholes literally render the list contents with index labels as the code runs.
- **Dictionaries:** labelled post-office drawers.
- **Recursion:** Nell's junk tower stacks frames as boxes.
- **Graphs:** the town map itself becomes the graph for BFS and Dijkstra.
- **Gradient descent:** a little hiker sprite walking down the observatory hill's loss surface.
- **RL:** Sir Reginald the crab moves on a gridworld track, with the learned value of each tile shown as a subtle tint and Q-values on hover. Training is animated, sped up, and can be paused and stepped.

These "Living Visualisations" are driven by the learner's actual running code (instrumented via the Python runtime, Section 10), not by fake animations.

### 7.7 Typography

- **Tool UI and lesson text:** a characterful but highly readable serif or humanist sans that is not one of the overused defaults. Do not use Inter, Roboto, Poppins, Montserrat, Open Sans, Lato, Space Grotesk, or the system font stack as the main face. Good directions: a book serif such as Source Serif 4 or Literata for lesson prose, paired with a sturdy grotesque such as IBM Plex Sans or Atkinson Hyperlegible for UI labels. Pick one pairing, justify it in `DECISIONS.md`, and use it consistently.
- **Code:** a properly designed monospaced font with clear distinction between `0`/`O`, `1`/`l`/`I`: JetBrains Mono or IBM Plex Mono.
- **Pixel text:** a small pixel font used only for character name tags and signs inside the world.
- Type scale: a real modular scale, set in `tokens.css`. Generous line height for prose (1.55 to 1.65), tighter for UI.
- Headings are plain, upright, no italic emphasis words inside headings, no gradient text, no text shadows.

### 7.8 Things that make a site look AI-generated. Do none of these.

Treat this list as a linter. Before marking any screen done, check it against every item.

**Visual tells**
- Purple, violet, indigo or blue-to-pink gradients anywhere.
- Gradient text. Glowing buttons. Glassmorphism, frosted panels, blurred background blobs.
- A centred hero with a big headline, a one-line subheading and two buttons side by side.
- A grid of three or four identical cards each with an icon, a bold title and two lines of grey text.
- Generic icon sets used decoratively (sparkles, rockets, lightbulbs, brains, magic wands, lightning bolts). Icons appear only where they carry meaning (run, stop, pass, fail).
- Rounded corners on everything at the same large radius. Use small radii (2 to 4px) or none; the tool should feel printed.
- Soft drop shadows on every card. Use hairline rules and spacing instead.
- Emoji in UI copy or headings.
- Every section the same height, same padding, same layout.
- Stock "3D blob" or isometric illustrations. Any AI-generated imagery.
- Fake dashboards with meaningless charts and numbers.
- Floating badges ("New!", "AI-powered", "Beta") scattered around.
- Animations on everything (fade-up on scroll for every block, bouncing buttons, hover lifts). Motion is used only where it explains something or gives feedback.

**Copy tells**
- "Unlock your potential", "embark on your journey", "level up", "dive in", "seamless", "supercharge", "empower", "elevate", "unleash", "revolutionise", "game-changer", "cutting-edge", "in today's fast-paced world".
- Em dashes. Do not use them anywhere in the product copy.
- Triplets ("Learn. Build. Grow."). Rhetorical questions as headings ("Ready to start coding?").
- Copy that would make sense on any other learning site. Every line of marketing copy must be specific to Saltmarsh, its characters or its actual curriculum. Test: if the sentence could appear on a competitor's site, rewrite it.
- Exclamation marks in UI copy.
- Over-explaining. Labels should be one or two words. Buttons say exactly what they do: "Run", "Check", "Next step", "Show hint".

**What to do instead**
- Show the real thing. The landing page leads with an actual screenshot or a live, playable mini-Job, not an illustration of a concept.
- Asymmetric, editorial layouts. Text set in a measured column (60 to 75 characters), with the pixel world as a distinct framed window.
- Use the characters and the town as the visual identity. A tired tortoise in an apron is memorable. A gradient is not.
- Use real specifics in copy: "Fourteen jobs on the Harbour Front. The first takes twenty minutes. The last one, the logbook, takes an evening."
- Small, handmade details: a stamp mark when a Job ships, a paper texture on the Shelf, a slightly wonky hand-drawn underline on the current Job, the bell over the bakery door ringing when Bea enters.
- Consistent design tokens in `tokens.css` (colours, spacing on a 4px base, radii, type scale), used everywhere. Inconsistency is a tell.

### 7.9 Sound (optional, off by default)

A small set of soft, diegetic sounds: the bakery bell, a gull, a typewriter key for Run, a stamp thunk for Ship, rain ambience. All off by default, one toggle in settings, respect `prefers-reduced-motion` and reduced sound. CC0 sources only, credited.

---

## 8. Screens and flows

Every screen below must be designed properly at desktop and phone widths. The Workbench is desktop-first (coding on a phone is secondary but must work for review cards, reading and small edits).

### 8.1 Landing page (logged out)

- Top: the name "Paul's Python Course" set plainly, and a one-line description specific to the product. Example direction: "Learn Python by fixing a small harbour town, one real program at a time. From your first print statement to reinforcement learning."
- A framed, live pixel scene of the workshop with Moss at his bench and rain on the window.
- Directly playable: **Job 1, The Sign on the Door**, in a cut-down Workbench, with no sign-up required. When it is finished, offer to create an account to keep it. Progress made before sign-up is carried into the new account.
- Below: the map of Saltmarsh with the eight districts and what you learn in each, written specifically. The full syllabus is expandable.
- A short, honest "how it works" section built from real screenshots: the Ask, Predict, Pip's Version, Make, the Shelf.
- A plain FAQ: Is it free (owner decision, see Section 19)? Do I need to install anything (no, until Act VI)? How long does it take? What level does it reach?
- No testimonials until real ones exist. No fake user counts.

### 8.2 Sign up and log in

- Email and password, magic link, and Google and GitHub OAuth.
- After sign-up: create your character (7.5), choose a display name, then a short placement question: "Have you written code before?" with three honest options. Learners with experience can take a **Placement Test** (a set of Make tasks per Act) to unlock Acts they already know. Placement passes are marked so review cards still cover those concepts.
- Then straight into the workshop. No multi-page onboarding tour. Moss gives one line and the first Job starts.

### 8.3 The Map (home when logged in)

- Pixel-art top-down map, pannable, with districts unlocking as above.
- Clicking a building shows the Jobs available there in a side panel: title, client portrait, estimated time, status (not started, in progress, shipped, shipped with stretch).
- A small panel: **Morning Rounds** (review due count, start button), **Continue** (exact step you were on), **Shelf** (portfolio).
- Locked districts are visible but dark, with a one-line description, so the learner always knows the destination.

### 8.4 The Workbench (the main learning screen)

Layout at desktop: three zones.
- **Left (narrow): the brief and steps.** The current Job's Ask summary, the step list (with the current step marked), and the step's instructions. Collapsible.
- **Centre (main): the editor and output.** CodeMirror 6 editor with Python syntax highlighting, line numbers, bracket matching, auto-indent, basic autocomplete of names in scope, a Run button, a Check button (on checkable steps), and an output console that also handles `input()` interactively. Tabs for multiple files when the Job has them. A step-through visualiser panel can open beside or below the console.
- **Top or right: the scene strip.** A small pixel window with the learner's character at their desk, Moss, and the client when present. Dialogue appears here. Dennis sits in the corner of this strip.

At phone width: the zones become tabs (Brief, Code, Output), with the scene strip collapsed to a single line of dialogue and a portrait.

Behaviour:
- Code autosaves to the server continuously (debounced, about every 2 seconds of inactivity) and locally (IndexedDB) for offline resilience. Never lose a learner's code.
- Version history per file: the learner can see and restore earlier versions of their code for this step (snapshots on every Run and Check).
- Keyboard shortcuts: Ctrl/Cmd+Enter to Run, Ctrl/Cmd+Shift+Enter to Check, documented in a small shortcuts sheet.
- Run is sandboxed and can be stopped. Infinite loops are interrupted cleanly with an explanation.
- Check shows a test report (Section 11).

### 8.5 Morning Rounds (review)

- 5 to 10 cards, mixed concepts, each a tiny code task in a mini editor or a predict question.
- Framed lightly as checking on old repairs: each card shows the client and building it relates to.
- After the session: a quiet summary (cards reviewed, which concepts were shaky) and a link straight to the related Job if the learner wants to revisit.

### 8.6 Drill mode

- Pick a concept you have unlocked. Get timed fluency tasks. Personal best times. Optional Pip race (Pip's times are a reasonable target that improves as you do).

### 8.7 The Shelf (portfolio)

- Every shipped Job appears as an object on shelves in the workshop's back room (a loaf for Bea's till, a little lighthouse for Tom's lamp check, a crab trophy for the RL championship). Clicking an object opens the final code, lets the learner run it again, and shows the date shipped.
- **Export:** download any project as a `.py` file or a zip, or export the whole Shelf as a GitHub-ready repository (folders per Act, a generated README per project with the brief and what was learned). If the learner connects GitHub (OAuth), offer one-click push to a new repository.
- **Public profile (opt-in):** a shareable page showing the learner's character, Acts completed and chosen projects, for university applications or CVs. Off by default.

### 8.8 Concept Index

- A searchable reference of every concept taught, each with a short explanation, a runnable example, the Jobs where it is used, and the learner's review strength for it. This becomes the learner's personal Python handbook.

### 8.9 Settings

- Account (email, password, connected logins, delete account, export all data as JSON).
- Character customisation.
- Editor (font size, theme follows site light/dark, tab size fixed at 4 spaces with an explanation why).
- Dialogue amount (full, less talk).
- Sound (off by default).
- Reduced motion.
- Daily goal (optional, minutes, default none). No streaks unless the learner turns them on.

### 8.10 Teacher and class mode (Phase 4, design the data model for it now)

- A teacher account can create a class, share a join code, see each student's progress per Job, test results and time spent, and assign specific Jobs. Students' code is visible to their teacher only if they joined that class.

---

## 9. Learning interactions in detail

### 9.1 Predict questions

- Types: multiple choice output, type the exact output, choose which line executes Nth, choose the value of a variable at a marked point.
- Each wrong option maps to a named misconception (store a list of misconceptions per concept, e.g. `range-includes-end`, `input-returns-number`, `assignment-copies-list`). Choosing a wrong option records that misconception on the learner's profile, and the review deck targets it later.

### 9.2 Parsons problems

- Drag and drop with keyboard support (move with arrow keys, indent with Tab and Shift+Tab).
- Indentation matters and is checked.
- Adaptive help after two failed attempts: combine two adjacent blocks, or fix one block in place with a note.
- Can be checked by order or by running (some orders are equivalent; checking by running the assembled code against tests avoids false negatives).

### 9.3 Fill-in and fix-the-bug

- Fill-in: editable gaps inside otherwise read-only code. Fix-the-bug: full editor with a known bug, checked by tests.

### 9.4 Step-through visualiser

- For any code in a Job (and in the learner's own code in Acts I and II), the learner can step through execution line by line, seeing the current line, variables in each frame, and object references drawn as boxes and arrows (in the style of Python Tutor, implemented by tracing with `sys.settrace` inside Pyodide).
- Limits: stop after a configurable number of steps (default 1000) with a clear message.
- Living Visualisations (7.6) hook into the same trace data.

### 9.5 Self-explanation prompts

- Short free-text answers ("Why is `int()` needed on line 3?"). Not graded by AI. After the learner submits, they see Moss's answer and mark themselves: "I had that", "Partly", "Missed it". This self-assessment feeds review scheduling.

### 9.6 Explain it to Dennis

- Three boxes: What should this do? What does it actually do? Which line is the first one that surprises you? Submitting highlights that line in the editor and opens the visualiser at that line.

### 9.7 Optional AI tutor (Phase 4, off by default, owner decision)

- If enabled, Moss can answer a free-form question about the learner's current code. It must follow strict rules: never write the full solution, respond in Moss's voice and length limits, ask a guiding question first, and only point at the subgoal or line. It is rate-limited and clearly labelled. The rest of the product must work fully without it, and all hints in Section 3.5 are human-written, not generated.

---

## 10. Running Python

### 10.1 Runtime

- Use **Pyodide** (Python compiled to WebAssembly) running inside a **Web Worker**, so the UI never freezes.
- Load packages on demand per Job (`numpy`, `pandas`, `matplotlib`, `scikit-learn` are available in Pyodide). Show a quiet loading line the first time a heavy package loads ("Fetching NumPy from the Records Office.").
- Cache Pyodide and packages with a service worker so the second load is fast and Acts I to V work offline once loaded.

### 10.2 Interrupting and limits

- Use a `SharedArrayBuffer` interrupt buffer (Pyodide's `setInterruptBuffer`) so Stop works on infinite loops. This requires cross-origin isolation headers (`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`); configure them on the host. If not available, fall back to terminating and restarting the worker.
- Default run timeout for Check: 10 seconds per test case in Acts I to III, longer for ML Jobs (configured per Job).
- Cap output size (e.g. 2000 lines) with a clear message.

### 10.3 input()

- `input()` must work interactively in the console: the run pauses, the console shows the prompt and a text field, the learner types and presses Enter. Implement with `SharedArrayBuffer` and `Atomics.wait` in the worker, or a stdin callback. Do not use the browser's `prompt()` dialog.
- For tests, `input()` is fed from the test case's scripted inputs.

### 10.4 Files and plots

- Each Job has a virtual file system (Pyodide's in-memory FS) seeded with the Job's data files. Learners can create files; files persist per Job per user (saved to the server).
- matplotlib output renders as an image in the output panel (use the Agg backend and capture figures as PNG).

### 10.5 Take It Home (local Jobs)

For PyTorch, Gymnasium, Pygame, git and web frameworks:
- The Job page gives a short, tested setup guide per OS (Windows, macOS, Linux): install Python, create a virtual environment, install requirements.
- The learner downloads a starter zip containing the brief, starter files, `requirements.txt` and a pytest test suite.
- Provide a small companion CLI (`ppc`, published to PyPI as part of the project or installable from the repo): `ppc login`, `ppc get <job-id>`, `ppc check` (runs the tests locally and uploads the results and code to the learner's account), `ppc submit`. Authentication uses a device-code flow linked to the learner's account.
- If the CLI is not built yet, the fallback is: run `pytest` locally and upload the project zip on the Job page; the server re-runs the tests in a sandbox (Section 12.4) or, for heavy ML Jobs, accepts the uploaded test report with a note.

---

## 11. Checking work

### 11.1 Test format

Each checkable step has a `tests.py` file (hidden from the learner, with some visible examples shown in the brief). Use a small custom harness built on top of plain Python so it runs in Pyodide without pytest, and use real pytest for Take It Home Jobs. The harness supports:
- **Output tests:** run the learner's program with scripted inputs, compare printed output (with options: exact, ignore trailing whitespace, ignore case, contains, regex, numeric tolerance).
- **Function tests:** import the learner's code as a module, call functions with arguments, compare return values (with tolerance for floats), check types.
- **Structure tests:** use the `ast` module to check things like "uses a for loop", "defines a function called `price`", "does not use `eval`", "does not hard-code the answers". Use sparingly and only where the learning goal needs it.
- **Property tests:** for later Acts, randomised inputs compared against a reference solution.
- **ML tests:** for model Jobs, check metrics on a held-out set exceed a threshold, check shapes, check that gradients match numerical gradients.

### 11.2 Feedback

- For each failed test: a short title, the input, the expected result, the learner's result, and an optional human-written hint tied to that specific test ("If this is the only one failing, check what happens when the order is zero.").
- Common mistakes are detected by pattern (e.g. output matches the expected output but with the number as a string, or off by one) and get a specific message.
- Tests are ordered from simplest to hardest; the report shows the first failing test prominently and the rest collapsed.

### 11.3 Anti-cheese

- Hidden tests use different values from visible examples.
- Structure tests prevent hard-coding expected outputs where appropriate.
- Completion of the Make step requires passing all required tests. Stretch tests are separate.

---

## 12. Technical architecture

Use this stack unless there is a strong reason not to (record it in `DECISIONS.md` if you deviate):

- **Framework:** Next.js (App Router) with TypeScript, strict mode.
- **Styling:** plain CSS with CSS custom properties defined in `tokens.css`, organised with CSS Modules. Do not use Tailwind's default palette or an off-the-shelf component kit's default look. If you use a headless component library for accessibility (e.g. Radix primitives), style every component from the tokens.
- **Editor:** CodeMirror 6.
- **Python:** Pyodide in a Web Worker (Section 10).
- **Backend:** Supabase: Postgres, Auth (email/password, magic link, Google, GitHub), Row Level Security, Storage (for exported zips, uploaded Take It Home submissions, and larger files). Server-side logic in Next.js route handlers and server actions.
- **Hosting:** Vercel (or Netlify), configured with the cross-origin isolation headers needed for Pyodide interrupts and `input()`. Make sure third-party embeds (OAuth redirects, fonts) still work under COEP; self-host fonts.
- **State:** React Server Components for data fetching, minimal client state, TanStack Query for client-side server data if needed.
- **Content:** stored in the repo as files (Section 14), validated at build time, compiled into a content bundle. Not stored in the database, so content is version controlled and reviewable.
- **Testing:** Vitest for unit tests, Playwright for end-to-end tests, a Python test runner for content tests (Section 21).
- **Analytics:** privacy-respecting, self-hostable event logging into Postgres (step started, step passed, hint used, time on step). No third-party ad trackers.
- **Error monitoring:** Sentry or equivalent (owner decision), off in development.

### 12.1 Folder structure (suggested)

```
/app                 Next.js routes
/components          UI components (each with a CSS Module)
/components/world    Map, sprites, scene strip, living visualisations
/components/workbench Editor, console, test report, visualiser, step types
/lib                 Shared logic: scheduling (FSRS), progress, auth helpers
/lib/python          Worker, runtime bridge, test harness, tracer
/content             All curriculum content (Section 14)
/sprites/src         Text-grid sprite sources
/public/sprites      Built sprite sheets
/scripts             build-sprites, validate-content, run-content-tests
/supabase            Migrations, seed, RLS policies
/cli                 The ppc companion CLI (Python package)
/tests               Unit and end-to-end tests
tokens.css, palette.json, CHARACTERS.md, PLAN.md, DECISIONS.md, CREDITS.md
```

### 12.2 Performance

- First load of the landing page under 200 KB of JS before Pyodide. Load Pyodide only when a Workbench opens (or when the landing page's playable Job is scrolled into view).
- The map is rendered on a single canvas with sprite batching, not hundreds of DOM nodes.
- Lighthouse performance score of at least 90 on the landing page.

### 12.3 Security

- All user data protected by Supabase Row Level Security: users can only read and write their own rows; teachers can read rows for students in their classes only.
- Never run learner code on the server except inside the sandbox described below.
- Rate limit auth endpoints and submissions.
- No secrets in client code. Environment variables documented in `.env.example`.

### 12.4 Server-side checking (for submissions that must be verified)

- For Take It Home uploads and for anti-cheat verification of capstones, run tests in an isolated sandbox (a container-based job runner with no network, CPU and memory limits, and a timeout). Design this behind an interface so it can be implemented later; in the first build, browser checking is trusted and server checking is a stub with a clear `TODO` in `PLAN.md`.

---

## 13. Accounts, saving and progress (the "everything saves" requirement)

### 13.1 What is saved, always

- Account and profile: display name, character appearance, settings.
- For every step the learner touches: their latest code for each file, snapshots on every Run and Check, status (not started, in progress, passed, seen solution), attempts, hints used, time spent, predict answers chosen, self-explanation text and self-rating.
- Per Job: status, completion date, stretch status, shipped artefact.
- Review deck: every card's scheduling state (FSRS parameters: stability, difficulty, due date, last review, lapses), review history.
- Misconceptions recorded and when they were last addressed.
- Drill personal bests.
- Collectibles (Dennises found), cosmetic unlocks, story flags (which Penhallow notes have been found).
- Placement test results.

### 13.2 How it saves

- Optimistic local saving to IndexedDB, synced to Supabase in the background, with a small, quiet sync indicator ("Saved" in grey text, or "Offline, will save when back" in amber). Never a modal.
- Conflict handling: if the same step is edited on two devices, keep both versions as snapshots and show the most recent, with a note that another version exists in history.
- On login from a new device, everything is restored: the learner lands exactly on the step they were last on, with the cursor in the editor where it was.
- Guest progress (from the landing page playable Job) is stored locally and merged into the account at sign-up.

### 13.3 Data model (Postgres, suggested)

- `profiles` (id = auth user id, display_name, character jsonb, settings jsonb, created_at)
- `job_progress` (user_id, job_id, status, started_at, shipped_at, stretch_done, time_spent_seconds)
- `step_progress` (user_id, job_id, step_id, status, attempts, hints_used, seen_solution, predict_choice, self_explanation, self_rating, time_spent_seconds, updated_at)
- `code_files` (user_id, job_id, step_id, filename, content, updated_at)
- `code_snapshots` (id, user_id, job_id, step_id, filename, content, reason [run|check|manual], created_at)
- `review_cards` (user_id, card_id, concept_id, stability, difficulty, due_at, last_reviewed_at, reps, lapses, state)
- `review_logs` (id, user_id, card_id, rating, reviewed_at, elapsed_days, scheduled_days)
- `misconceptions` (user_id, misconception_id, count, last_seen_at, last_addressed_at)
- `drill_bests` (user_id, drill_id, best_ms, achieved_at)
- `collectibles` (user_id, item_id, found_at)
- `story_flags` (user_id, flag_id, set_at)
- `submissions` (id, user_id, job_id, kind [browser|local|upload], results jsonb, storage_path, created_at)
- `classes`, `class_members`, `assignments` (for teacher mode)
- `events` (id, user_id, type, payload jsonb, created_at) for analytics

All tables with RLS. Write migrations in `/supabase/migrations`. Seed a demo user with progress through half of Act I for development and testing.

### 13.4 Account deletion and export

- Delete account removes all rows and stored files for that user (with a confirmation that requires typing the display name).
- Export all data downloads a JSON file plus a zip of all code.

### 13.5 The Crab League (Act VII, later phase)

- Learners can submit their trained RL agent (as a small policy file, e.g. a Q-table or a small network's weights in a defined format) to a weekly league. Races run in the browser on a fixed seed and a shared leaderboard shows results. Strictly opt-in, display names only.

---

## 14. Content format

All curriculum content lives in `/content` as plain files so it can be written, reviewed and edited by hand.

```
/content
  /acts
    /01-harbour-front
      act.yaml                 title, district, intro dialogue, order of jobs
      /01-sign-on-the-door
        job.yaml               id, title, client, estimated_minutes, concepts_introduced, concepts_reviewed, ask (dialogue + spec), ship scene, stretch tasks
        /steps
          01-predict.md        frontmatter (type, id, concept, options with misconceptions) + body
          02-worked.md
          03-pips-version.md
          04-parsons.yaml
          05-make.md
        /starter               starter files per step
        /tests                 tests per checkable step
        /solutions             reference solutions (never sent to the client)
        /data                  data files
  /concepts                    one file per concept: id, title, explanation, example, misconceptions, card variants
  /characters                  dialogue pools per character per event
  /misconceptions.yaml
  /story                       Penhallow notes and their placement
```

- Write a schema (with Zod) for every file type and a `scripts/validate-content.ts` that fails the build on any invalid file, broken reference (a job referencing an unknown concept, a step with no tests), or missing translation of a required field.
- Write `scripts/run-content-tests.py` that, for every checkable step, runs the reference solution against its tests (must pass) and the starter code against its tests (must fail). Run it in CI.
- Solutions are never shipped to the client bundle. The "show solution" feature fetches it from the server only when the rules in 3.5 are met.
- Keep a short `content/STYLE.md` covering voice, the banned phrases list from 7.8, no em dashes, British or American spelling (pick one: use British spelling to suit Saltmarsh), code style (PEP 8, f-strings, honest names).

### 14.1 Fully written example: Act I, Job 3, "Bea's Till, part 2"

Use this as the quality bar for all content. Match its length, tone and structure.

**The Ask**
> **Bea:** The till from last week works. But it only knows one order.
> **Bea:** I want it to ask. What are you buying, how many, then tell me the price.
> **Moss:** It'll need to listen, then.

Spec shown beside the dialogue:
> Ask for the item (bread or bun) and the quantity. Bread is 2.40, a bun is 0.85. Print the total with two decimal places.
> Example run:
> `Item? bread`
> `How many? 3`
> `That's 7.20, please.`

**Step 1: Predict**
```python
count = input("How many? ")
print(count * 2)
```
> If you type `3`, what does this print?
Options: `6` (misconception: input-returns-number. Feedback: "input() always hands you text. The text "3" doubled is "33"."), `33` (correct), an error (misconception: str-times-int-errors. Feedback: "Text times a whole number is allowed in Python. It repeats the text."), `3 3` (misconception: repetition-adds-space).
After answering, the learner runs it and types 3 themselves.

**Step 2: Investigate**
> Add `print(type(count))` on a new line and run it again. What type is `count`?
Free answer checked against `str`, `<class 'str'>`. Then: "Change line 1 so `count` holds a whole number." Checked by running: output must be 6 for input 3.

**Step 3: Worked example with subgoals**
Moss shows a different program (Captain Ferro's rope calculator: metres of rope times price per metre) with subgoal labels in the margin:
1. Ask for the text
2. Turn the text into a number
3. Work out the answer
4. Show it, rounded

Self-explanation prompt: "Why does Moss use `float` here and not `int`?" Model answer: "Rope comes in parts of a metre, like 2.5. `int` can't read "2.5"."

**Step 4: Pip's Version**
> **Pip:** Done already. Look.
```python
item = input("Item? ")
qty = input("How many? ")
if item == "bread":
    total = qty * 2.40
else:
    total = qty * 0.85
print(f"That's {total:.2f}, please.")
```
> **Pip:** It crashes. I think Python is broken.
The learner fixes it. Tests: bread x3 gives 7.20, bun x4 gives 3.40, bread x0 gives 0.00. Specific feedback if `int()` is wrapped around the wrong thing.

**Step 5: Make**
Starter file is empty except a comment block with the four subgoal labels from the worked example. Visible tests: bread x3, bun x2. Hidden tests: bread x1, bun x10, bun x0, "Bread" with a capital B (stretch only, not required). Structure test: none. Hints: Nudge ("What does `input()` give you, and what does multiplication need?"), Plan (the four subgoals with a fifth: "choose the price"), Shape (code skeleton with blanks).

**Ship**
> **Bea:** Seven twenty for three loaves. That's what I'd have said.
> **Bea:** Good. I'll stop doing it on the back of a paper bag.
Shelf object: a small loaf of bread with a price tag. Concept cards added: `input-returns-text`, `int-conversion`, `float-conversion`, `f-string-decimals`.

**Stretch**
1. Accept "Bread", "BREAD" and " bread " as well.
2. If the item is not bread or bun, print "We don't sell that." and stop.

### 14.2 Card variant example (concept: `input-returns-text`)

1. Predict: `x = input()` with input `5`, then `print(x + x)`. Answer `55`.
2. Fix: `age = input("Age? ")` then `print(age + 1)` crashes. Fix the line.
3. Fill: `n = ___(input("Number? "))` so that `n * 2` works for whole numbers.
4. Predict: `type(input())` with input `3.5`. Answer `<class 'str'>`.
5. Write: one line that reads a decimal number into a variable called `price`.

---

## 15. Accessibility

- WCAG 2.2 AA throughout the tool UI.
- Everything keyboard accessible, including Parsons problems, the map (list view alternative), and the visualiser.
- Screen reader support: the map has a full list-based equivalent; sprites have text alternatives; dialogue is real text; test results are announced via a live region.
- Colour is never the only signal.
- `prefers-reduced-motion` disables idle animations, rain and animated transitions.
- Dyslexia-friendly option: switch lesson prose to Atkinson Hyperlegible or OpenDyslexic, increase spacing.
- Editor font size adjustable; minimum touch target 44px on phone.

---

## 16. Motivation without manipulation

- **Allowed:** the town coming back to life, Shelf objects, specific client reactions, story notes, cosmetic milestones, a visible map of where you are going, honest time estimates, personal best times in Drills, an optional daily goal.
- **Not allowed:** guilt notifications, streak loss shaming, fake scarcity, leaderboards for general progress (only the opt-in Crab League), XP inflation, lives or hearts that block learning, interstitial celebrations for trivial actions, notifications by default.
- Email: only account emails by default. An optional weekly summary email (opt-in) in Moss's voice: three lines, what you shipped, what is due for review, nothing else.

---

## 17. Microcopy reference

Use these as the model for all UI text.

- Run button: "Run". Check button: "Check". Stop: "Stop".
- While running: "Running." After a run with no output: "Ran. Nothing was printed."
- Tests all pass: "All checks passed." Followed by the client's line.
- Some tests fail: "3 of 5 checks passed." First failure shown below.
- Hint buttons: "Nudge", "Plan", "Shape". After three: "Show solution" (only when allowed).
- Saved state: "Saved", "Saving", "Offline. Will save when you're back."
- Empty Shelf: "Nothing on the shelf yet. Bea's till is first."
- 404 page: a pixel scene of Pip lost on the pier. "Pip took a wrong turn. So did this link." with a link back to the map.
- Error loading Python: "Python didn't start. This is usually the connection. Try again." with a retry button and a details toggle.

---

## 18. Landing page copy direction

Write the final copy yourself, following 7.8, but use this direction:

- Opening line about the town and the learner's role, not about "learning to code". Example: "Saltmarsh is falling apart. Its engineer left decades ago and took the manual with her. You're the new apprentice at the repair shop."
- Second line states the outcome plainly: "Every job is a real Python program. By the last one, you'll have written a neural network and taught a crab to race."
- Then the playable Job 1.
- Then the map and syllabus.
- Then "how it works" with real screenshots.
- Footer: plain, small, with links to the syllabus, FAQ, credits and privacy.

---

## 19. Owner decisions (ask, then continue)

Flag these in your first report and proceed with the stated defaults:
1. Pricing: default is free during development, with the data model ready for a paid tier (an `entitlements` table) but no payment integration built.
2. Domain and hosting accounts: default to Vercel and Supabase free tiers; owner provides keys.
3. Optional AI tutor: default off and not built until Phase 4.
4. Spelling: default British.
5. Analytics provider: default self-hosted events table only.

---

## 20. Legal and privacy

- Privacy policy and terms pages (plain English, draft clearly marked for owner review).
- Collect the minimum data. Age gate: users must be 13 or older; if under 16 in regions that require it, show a parental consent notice (owner to review).
- Cookie banner only if non-essential cookies are used (aim for none).
- All third-party assets credited in `CREDITS.md` with licences.

---

## 21. Quality and testing

- **Unit tests:** scheduling algorithm, progress logic, content parser, test harness, misconception mapping.
- **Content tests:** every reference solution passes its tests; every starter fails; every predict question's correct answer matches the actual output of running its code (generate this automatically, do not trust hand-written answers).
- **End-to-end tests (Playwright):** sign up, create character, complete Job 1, close browser, log in on a fresh context, confirm code and progress restored; complete a review session; stop an infinite loop; answer an `input()` prompt in the console; export the Shelf; delete the account.
- **Visual checks:** take screenshots of every screen at 1440px and 390px in light and dark mode, and check them against the 7.8 list. Store them in `/tests/screenshots` and review them yourself.
- **Copy lint:** a script that scans all content and UI strings for em dashes, exclamation marks in UI copy, emoji, and the banned phrases in 7.8, and fails CI if any are found.
- **Accessibility:** run axe on every page in CI.

---

## 22. Build phases

Work through these in order. Each phase ends with a working, deployed, tested app.

**Phase 1: The vertical slice**
- Project setup, tokens, typography, palette, sprite build pipeline.
- Moss, Pip, Dennis, Bea and the learner character sprites; workshop interior scene; a first version of the Harbour Front map.
- Supabase schema, auth (email/password and magic link first), RLS.
- Workbench with CodeMirror, Pyodide worker, Run, Stop, interactive `input()`, output console, test harness, Check, test report.
- Step types: Ask, Predict, Investigate, Worked example, Pip's Version, Parsons, Make, Ship.
- Autosave, snapshots, restore on any device.
- Act I Jobs 1 to 4 fully written and tested.
- Landing page with playable Job 1 and guest-progress merge.

**Phase 2: Act I and II complete**
- All of Act I and Act II content.
- Review deck with FSRS, Morning Rounds, concept cards for every concept.
- Step-through visualiser and the first Living Visualisations (Old Tom's lamp, Mira's pigeonholes).
- Shelf, export to zip and to a GitHub-ready repo.
- OAuth (Google, GitHub), character customisation, settings, dark mode, Concept Index.
- All remaining Act I and II characters and town buildings.
- Drill mode.

**Phase 3: Acts III to V**
- Content for Acts III, IV, V.
- Package loading (NumPy, pandas, matplotlib, scikit-learn), plot rendering, data files.
- Living Visualisations for recursion, sorting, graphs, gradient descent.
- Placement test.
- Take It Home flow with zip download and upload.

**Phase 4: Acts VI to VIII and extras**
- Content for Acts VI, VII, VIII, the `ppc` CLI, Gymnasium and PyTorch Take It Home Jobs.
- RL gridworld visualisation with Sir Reginald, Crab League.
- Teacher and class mode.
- Optional AI tutor (if the owner approves).
- Penhallow story conclusion, Moss's radio, final cosmetic unlocks.
- Public profile pages.

At the end of every phase, write a short report in `PLAN.md`: what is done, what was deferred and why, known issues, and the screenshots of every new screen.

---

## 23. Final checklist before calling any phase done

- [ ] A brand-new user can sign up, learn, leave, and come back on another device to exactly where they were.
- [ ] Every checkable step's reference solution passes and starter fails.
- [ ] No screen uses any item from the 7.8 list. Checked by looking, not assumed.
- [ ] No em dashes, emoji or banned phrases anywhere in the product (copy lint passes).
- [ ] Every sprite is on-palette, whole-number scaled and crisp.
- [ ] All screens work at 390px and 1440px, light and dark.
- [ ] Keyboard-only use works for every step type.
- [ ] Infinite loops can be stopped; `input()` works in the console.
- [ ] Lighthouse score 90+ on landing, axe passes on every page.
- [ ] `PLAN.md` and `DECISIONS.md` are up to date.

Now start with Section 0: write `PLAN.md`, then begin Phase 1.
