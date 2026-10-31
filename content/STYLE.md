# Content style

Read `../CHARACTERS.md` first. This file covers everything that is not dialogue.

## Voice

- Dry, warm, understated. Funny the way a good teacher is funny: deadpan and specific.
- Assume intelligence, not prior knowledge. Never talk down. Never gush.
- Every sentence should be specific to the Clocktower, the class or the program being built. If a sentence could appear on any other learning site, rewrite it.
- Write the place and product names as they are: "the Clocktower", "the Workshop", "Paul's Python Course". There is no town-name token any more.

## Length

- No step has more than about 150 words of prose before the learner has to do something. The build warns at 150 and fails at 175.
- Dialogue lines are mostly under 20 words.
- Buttons and labels are one or two words.

## Banned

The copy lint (`npm run lint:copy`) fails on these:

- Em dashes, anywhere. Use commas, full stops or colons.
- Emoji.
- Exclamation marks in UI copy and step prose. Dialogue may use one per Job.
- "Unlock your potential", "embark", "journey", "level up", "dive in", "seamless", "supercharge", "empower", "elevate", "unleash", "revolutionise", "game-changer", "cutting-edge", "in today's fast-paced world", "awesome", "great job", "coming soon".
- Slogan triplets ("Learn. Build. Grow.") and rhetorical questions as headings.
- Generic praise. A pass gets one short, specific line from the client.

## Spelling

British: colour, organise, behaviour, centre, grey, catalogue, programme (but "program" for software).

## Code

- PEP 8. Four-space indents.
- f-strings for formatting from Act I Job 3 onward.
- Honest names: `total_price`, not `x`; `tasks`, not `list1`. A classmate's version may use bad names when that's its bug; Paul's examples never do.
- Code in prose goes in backticks: `print()`, `input()`.
- Starter files carry the subgoal labels as comments when the worked example introduced them.

## Steps

- **Predict:** every wrong option names a misconception from `misconceptions.yaml` and has feedback that explains exactly that misconception. The correct answer is checked automatically by running the code; do not trust a hand-written answer.
- **Fix a classmate's version** (`type: pips`, titled "Fix Caitlin's version" and so on): the bug is a real novice mistake that fits that classmate, never a silly one. The tone is friendly, never mocking.
- **Worked example:** a similar but not identical problem, split into labelled subgoals. The labels are the point.
- **Make:** visible tests show two typical cases; hidden tests use different values, and the edge cases.
- **Hints:** Nudge asks a question. Plan lists the subgoals. Shape is a skeleton with the key expressions blanked out as `___`.

## Tests

- Tests are ordered simplest first.
- Each hidden test that guards an edge case gets a `hint` written for a learner who fails only that one.
- Use structure checks only where the learning goal needs them (for example, "uses a for loop" in the loops Job).
