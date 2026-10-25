# Characters

The bible for every line of dialogue and every sprite in Fixwick (content writes the town's name as `{{town}}`; see `content/AUTHORING.md`). Content must follow it. When a line feels generic, it is wrong: make it specific to the person, the town or the program. How the art is drawn (sizes, frames, palette) is in `sprites/README.md`; this file is who everyone is.

## Rules for everyone

- Short lines. Most are under 20 words. Nobody gives speeches.
- At most one exclamation mark per project, across all dialogue, and only when it is earned.
- No emoji. No em dashes. Commas, full stops and colons.
- No fourth-wall breaks. Nobody mentions AI, apps, screens, "your learning journey", levels or progress bars. The town is real to them.
- No generic praise. Praise is specific and understated: "The till balanced. Bea counted twice."
- British spelling and British understatement.
- **Reactive lines.** Characters react to real events in the learner's code: a check passed first time, the third miss in a row, a loop that never runs, the first f-string, a variable called `x` holding a price, a well-named `total_price`, a function doing four jobs. The events come from cheap static checks (Python's `ast`, run inside each Run) and from run and check results. The rules are in `lib/reactions.ts`; the lines are pools in `content/characters/*.yaml`. A line may name something from the learner's code with `{name}`.
- **No repeats.** The last 30 lines shown to each learner are remembered and never repeated. When every line in a pool has been said lately, the character says nothing.
- **Recap on return.** After a break of four hours or more, Moss says one line and the current client says where the learner had got to (`recap` pools, with `{step}`). Never guilt, never a streak, never "we missed you".
- **Expressions.** Every line has a portrait expression. Reactions pick one (a first-try pass is `proud`, a traceback `squinting`); authored lines can set `face:`. Clients are `delighted` when their project ships.

---

## The core three

### Moss (mentor)

**An old tortoise. Owns the workshop. Act I to the end.**

- **Look:** broad and low. A domed moss-green shell with hexagonal plates outlined in darker green, and **one cracked plate repaired with a riveted brass patch**: his signature, and it catches the light. A brown leather apron with a spanner in the pocket. Round brass-rimmed glasses pushed up on his head, which slip down when he concentrates (his idle). Heavy-lidded, kind eyes. A slow, deliberate head tilt.
- **Signature colours:** moss green and brass.
- **Personality:** patient, dry, exact. Loves good tools and honest names. Distrusts anything clever. Secretly delighted by the learner's progress and bad at saying so.
- **Role:** the teacher. Gives the three hints (Nudge, Plan, Shape) in the dialogue box, the worked examples, the error explanations under a traceback, and the code reviews when a project ships.
- **Arc:** he has been failing to fix an old valve radio for years. Over the course the learner helps him read its schematic, which is a program in disguise. In the final Act it plays music, and he finally says something warm.
- **Reacts to the learner's code:** good names ("`total_price`. Good. I know what it holds."), single letters holding money ("`x` holding a price. What's `x` in a week's time?"), long functions ("That function does four jobs. Give three of them away."), loops that never run, the first f-string, the first `def`.
- **Says things like:** "Read it from the bottom. The last line is where it hurt." / "Name it for what it holds, not what you hope it holds." / "Measure twice."
- **Never:** hurries, exclaims, explains for longer than three lines, writes the full answer before the learner has had a proper go.
- **Portrait expressions:** neutral, pleased, proud, worried, confused, annoyed, laughing, squinting, surprised, plus talk, blink and the glasses-slip idle.

### Pip (rival and friend)

**A city pigeon. The other apprentice. Writes "Pip's Version".**

- **Look:** scruffy, compact, puffed chest. Slate-grey feathers with a darker wing bar, and an **iridescent neck that shifts teal to violet** (a two-frame shimmer when he's proud). A stubby pencil behind one eye, and a satchel overflowing with crumpled printouts. Bright orange eyes, a lot of attitude. Leans forward when he talks.
- **Signature colours:** slate grey with a teal-violet neck.
- **Personality:** fast, confident, funny, usually wrong in specific and believable ways. Never stupid. Competitive with the learner in Drills.
- **Role:** gets the task wrong in a believable way so the learner can find and fix it. His ghost time races the learner in Drills.
- **Arc:** he starts by "fixing" everything with extra `if` statements. His bugs grow up with the learner: off-by-one, mutable defaults, train/test leakage, reward hacking in the RL Act. By the end he writes his first test before his code, and he credits the learner for it in his own clumsy way.
- **Reacts to the learner's code:** a first-try pass ("That was luck. Do it again."), a fix shorter than his version ("Mine had more features."), nested loops, a long program with no loop in it.
- **Says things like:** "Done already. Well. Mostly done." / "I fixed it by adding an if. Then another one."
- **Never:** is mocked by the narration. He is a peer, and he learns.

### Dennis (debugging duck)

**A yellow rubber duck. 16x16. Never speaks.**

- **Look:** a classic yellow rubber duck with an orange beak, a **chip out of the beak** and slightly faded paint on one side.
- **Role:** "Explain it to Dennis". The duck button in the step path opens a drawer; the learner explains what the code should do, what it does, and which line surprises them. Then one narration line, with no name plate: "Dennis listens." / "Dennis tilts, very slightly." / "Dennis has heard worse."
- **Collectible:** twelve Dennises hide around the map. Finding them all earns a note from Moss at the end and nothing else.

### The learner

- Built at sign-up from layered parts: species (otter, hare, badger, fox, heron, frog, mole, seal), fur or feather colour, jumper, accessory (scarf, beanie, round glasses, cap, headphones, none). Their head is the avatar in the HUD.
- The learner's portrait appears in the dialogue box only when they speak, which is rare: choices in story moments.
- These species are kept for learners, so nobody in town looks like you by accident.

---

## Clients: one per Act, each with a small arc

Each client owns an Act (the curriculum is in `REDESIGN.md` Section 7). The town's people are animals, like Moss and Pip, and each has one signature colour that nobody else uses as a main colour.

| Client | Species | Signature colour | Acts |
| --- | --- | --- | --- |
| Bea Hollis, baker | hedgehog | tomato red | I |
| Captain Ferro, ferry captain | walrus | navy | I, IV |
| Mira Tan, postmistress | mouse | mustard | II |
| Dev and Kat, bike and boat hire | ferrets | caps in opposite colours | II, III |
| Nell Brannigan, scrapyard | brown bear | welding orange and soot | IV |
| Priya Lund, weather station | puffin | raincoat yellow and lab white | V |
| Professor Ines Wendt, observatory | hoopoe | plum, starry | VI, VII |
| The Arcade Committee | three herring gulls | green blazers | VIII |
| Sir Reginald, the committee's crab | shore crab, with a monocle | crab red | VIII |
| Ada Penhallow, the missing engineer | stoat in her white winter coat | white fur, ochre oilskin | IX |

### Bea Hollis, baker (Act I)
- **Look:** round and rosy, a tomato-red headscarf, flour handprints on her apron, a wooden spoon.
- **Voice:** practical, warm, suspicious of computers. Counts everything twice.
- **Arc:** from "I don't trust it" to running her whole bakery on the learner's programs.
- **Lines:** "I don't need it fancy. I need it right on a Saturday." / "Seven twenty for three loaves. That's what I'd have said."
- **Ship reaction:** she checks the program's answer against her own arithmetic, out loud.

### Captain Ferro, ferry captain (Act I, Act IV)
- **Look:** a huge navy greatcoat, an enormous white beard that hides his mouth (so his expressions are all eyebrows), and a pipe.
- **Voice:** nautical terms he expects you to know already. Wants everything "shipshape", which means tested.
- **Running joke:** the beard eats his words.
- **Lines:** "Fares, by the tide. Not by guesswork." / "Shipshape means it's been tested. Has it been tested."

### Mira Tan, postmistress (Act II)
- **Look:** neat and small, round glasses, a mustard cardigan with a pen in every pocket.
- **Voice:** loves labels, lists and order. Becomes the learner's ally for files and data.
- **Lines:** "Pigeonhole three. Not four. Three." / "Everything has a place. Mostly it is in the place."

### Dev and Kat, bike and boat hire (Act II, Act III)
- **Look:** sibling ferrets in matching cycling caps of opposite colours, a spanner each.
- **Voice:** they argue constantly, which makes them perfect for inheritance against composition, and Flask against "just a script".
- **Lines:** Dev: "A tandem is a bike." Kat: "A tandem has a bike. Two, arguably."

### Nell Brannigan, scrapyard (Act IV)
- **Look:** huge gloves, welding goggles on her forehead, a booming laugh.
- **Voice:** knows where everything is in her piles and can't explain how. That is the point of the algorithms Act.
- **Lines:** "It's in the third pile from the gate. Don't ask me how I know."

### Priya Lund, weather station (Act V)
- **Look:** a lab coat over a raincoat, a clipboard, a careful squint.
- **Voice:** a careful scientist who objects to dishonest charts.
- **Lines:** "That axis starts at forty. Start it at zero, or tell people you didn't."

### Professor Ines Wendt, observatory (Acts VI and VII)
- **Look:** wild grey hair (the hoopoe's crest), a star-patterned scarf, chalk on her hands.
- **Voice:** enthusiastic and rigorous. Corrects herself mid-sentence.
- **Lines:** "The model is learning. Well, it is minimising a loss, which is not the same thing."

### The Arcade Committee and Sir Reginald (Act VIII)
- **Look:** three identical old gulls in matching green blazers who run the pier arcade and take its leaderboards far too seriously. Their crab mascot, Sir Reginald, is the RL agent sprite: monocle, rosette.
- **Voice:** they finish each other's sentences.

### Ada Penhallow, the missing engineer (Act IX)
- Seen only in an old photo until the end. Her sprite at the reveal is the most detailed in the game.
- Present through code comments, notes and photographs. Her comments are witty, precise and occasionally sad, and they show what good comments look like.
- Example: `# Tide offset for the north quay. Agnes says it's wrong. Agnes is right, but only in winter.`

### Recurring townsfolk
- **Old Tom, lighthouse keeper** (old grey tomcat): slow, gentle, repeats his story about the 1987 storm. Loves routine, so he owns loops. "Same check every night. Has been since '62."
- **Agnes Rook, harbour master** (rook): efficient; her requests read like real requirements. "Requirements. One: it logs boats in. Two: it logs them out. Three: it does not lose any."
- **Gwen, landlady of The Drowned Anchor** (goose): wry; runs the worst pub quiz in the county and knows it.
- **Mr Okonjo, tailor** (owl): precise to the millimetre. "A measurement written down wrong is worse than one not taken."
- **Mrs Vance, librarian** (sheep): fierce about duplicate records. "Two cards for the same book. Two. In my library."
- **Sanjay, greengrocer** (red squirrel): chatty, optimistic, terrible at maths. "Three for a pound, or is it four. Customers like four."
- **Mr Ashby, Records Office clerk** (lop-eared rabbit): quiet, dry, secretly delighted when someone asks about his data.

---

## Running jokes that pay off

- **Moss's biscuit tin** is empty every time the learner looks. It is full in the final scene.
- **Ferro's beard** eats his words: his lines sometimes trail off into it.
- **Pip's satchel** grows as his printouts pile up, then shrinks once he starts testing.
- **The radio** on Moss's back bench, finally fixed in the last Act with the learner's help.

---

## Facts established in the content

Later projects must agree with these.

- Moss is very old: the 2011 census (Act IV, The Census Tables) gives him as 121. The biscuit tin has been empty since 1987.
- Mr Ashby's first name is Kenneth (the census).
- The Hollis family have been the bakers in every census since 1921.
- Penhallow appears in the 1981 census as an engineer living "on the Hill". She went up the hill to build the learning machine, then left it running and moved into the lighthouse, where Old Tom has kept her secret for fifteen years. The 2011 census missed her: Tom told the enumerator the lamp room was storage.
- Penhallow once raced a crab, Lady Agatha, who won the autumn cup on whelks.
- The machine on the hill runs the lamp, the fog horn and the sea wall gate. It learned what Penhallow did over six winters, never why, and had no tests until the lamp room.
- The old harbour radio frequency is 96.4.
