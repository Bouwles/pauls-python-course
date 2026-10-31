---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya: "Locker codes. I seeded it, so every run does the same work. Fair timing."
  - yahya: "Neil says Monday's codes opened Tuesday's lockers. Can you look at mine?"
dialogue_after:
  - yahya: "So the seed made every run the same. Great for timing. Terrible for locks."
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
Yahya's program gives three lockers a code each. Run it twice and compare.

Fix it so every run gives new codes nobody could work out. Use `secrets` for the digits: it has the same `choice`, but it can't be seeded, and nobody can predict what it picks next.
