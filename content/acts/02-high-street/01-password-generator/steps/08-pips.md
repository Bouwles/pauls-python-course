---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Locker codes. Random, and I can check them, because they come out the same every run."
  - pip: "Mira says Monday's codes opened Tuesday's lockers. That has to be a coincidence."
dialogue_after:
  - pip: "So the seed made them the same every run. On purpose. That was the clever bit."
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
Pip's program gives three parcel lockers a code each. Run it twice and compare.

Fix it so every run gives new codes nobody could work out. Use `secrets` for the digits: it has the same `choice`, but it can't be seeded, and nobody can predict what it picks next.
