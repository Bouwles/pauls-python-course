---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya.proud: "I did the controller locker codes and seeded it, which means every run does the same work and the timing's fair."
  - yahya.confused: "Caitlin reckons Monday's codes opened Tuesday's lockers. Could you have a look at mine?"
dialogue_after:
  - yahya.laughing: "Right, the seed made every run the same, which is great for timing and pretty terrible for locks."
hints:
  nudge: "Run it twice. What does `random.seed(2026)` do to the numbers that come after it?"
  plan:
    - Run it twice and compare the codes
    - Take out the seed
    - Pick each digit with secrets.choice instead of random.choice
  shape: |
    import ___
    import string


    def locker_code(length=6):
        """Return a locker code: length random digits."""
        code = ""
        for _ in range(length):
            code += ___.choice(string.digits)
        return code
---
Yahya's program gives three lockers a code each. Run it twice and compare the codes.

Fix it so every run gives new codes that nobody could work out. Take out the seed, and pick each digit with `secrets.choice` instead of `random.choice`.
