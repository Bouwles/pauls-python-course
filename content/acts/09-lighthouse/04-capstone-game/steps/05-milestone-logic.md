---
id: logic-tested
type: milestone
title: "Milestone 2: the logic, tested"
evidence: link
dialogue:
  - paul: "No window yet. If the rules are right, the window is decoration."
  - caitlin: "Decoration is the best part."
  - paul: "Then it'll still be the best part next week."
checklist:
  - id: agreed
    text: "Every test in test_rules.py and test_scores.py passes."
    why: "These are Caitlin's rules. Until they pass, there's no game to draw."
  - id: mine
    text: "At least five tests of your own in tests/test_mine.py check the rules, and pass."
    why: "You know which of your if statements you're least sure of. Test that one first."
  - id: no-pygame
    text: "pier.py and scores.py don't import pygame, and the agreed test that checks it passes."
    why: "The moment the rules import pygame, every test needs a screen. Keep them apart."
  - id: seeded
    text: "All the randomness comes from the game's own seeded generator, so one seed replays one game exactly."
    why: "When a player swears the game cheated, you can play their game again, frame by frame."
  - id: one-frame
    text: "update() does one frame of rules and nothing else: no drawing, no keys, no waiting."
    why: "One frame in, one frame out. Then a test can run ten thousand frames in a blink."
  - id: named-numbers
    text: "Every size and speed is a named constant at the top of pier.py, not a bare number in a method."
    why: "When Caitlin says it's too fast, you change one line, and you know which."
  - id: scores
    text: "High scores survive the game being closed, and a missing scores file means an empty table, not a crash."
    why: "The first time the cabinet is switched on, there is no file. That's the time it most needs to work."
---
All the rules, and no window. Write `pier.py` until `tests/test_rules.py` passes, then `scores.py` until `tests/test_scores.py` does.

`update()` does one frame and nothing more, in the order the docstring gives: everything falls, catches and misses are settled, the level is worked out, and only then might something new appear. Change the order and a mackerel can be caught the frame it appears, or a game can carry on after its last life.

Keep every random choice on `self.rng`, the game's own generator. Python's shared `random` module would work too, until two games run at once in a test and draw each other's numbers.

Paste a link to the repository.
