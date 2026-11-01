---
id: plan-and-rules
type: milestone
title: "Milestone 1: the plan and the rules of the game"
test_plan: true
evidence: none
dialogue:
  - caitlin.thinking.point: "Write the rules so a player could referee. They will, whether you write them or not."
checklist:
  - id: rules
    text: "Caitlin's five rules are in your own words, precise enough to settle an argument."
    why: "If two players can read a rule two ways, they will, loudly, at closing time."
  - id: numbers
    text: "Every number the rules depend on is in your plan: sizes, speeds, how often things fall, points, lives."
    why: "A game is mostly numbers. Write them down and you can change them on purpose."
  - id: split
    text: "Your plan says which file does what: rules in pier.py, high scores in scores.py, keys and drawing in main.py."
    why: "Rules that know nothing about the screen can be tested without one. That's the whole trick of this job."
  - id: edges
    text: "You've listed the awkward moments: two things landing together, a boot on the last life, the bucket at the very edge."
    why: "Games break at the edges. Find them on paper, where they're cheap."
  - id: plan
    text: "Your test plan has at least three tests the agreed suite doesn't already have."
    why: "Caitlin's tests check her rules. Yours check the things only you know you've done."
  - id: setup
    text: "The project has its own virtual environment with pygame installed, and it's in a git repository."
    why: "pygame is big and particular about versions. Give it a home of its own."
  - id: sketch
    text: "You've sketched the screen: where the score, lives and level go, and what game over looks like."
    why: "Players read the score from across the Arcade. Put it where they'll look."
---
Read `pier.py`'s docstring and `tests/test_rules.py` side by side: the tests are Caitlin's rules, made exact. Then write the rules out in your own words, with every number in them: how wide the bucket is, how fast things fall at each level, how often something new appears.

List the awkward moments. What if a mackerel and a boot land in the same frame? What if the last life goes in the same frame as the tenth mackerel? Each one is a line in your test plan, with what should happen.

Sketch the screen on paper last. It's the part everyone wants to do first.
