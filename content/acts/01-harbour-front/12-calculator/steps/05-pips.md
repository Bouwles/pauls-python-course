---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin: "I had a go at Riya's calculator. Nothing can crash it. I caught everything."
  - caitlin: "She typed 2 + 2 and it said they weren't both numbers. Can you look? Something's off."
dialogue_after:
  - caitlin: "So the except was hiding my typo and blaming Riya. Catching everything isn't the same as working."
hints:
  nudge: "Which error did Caitlin mean to catch? Catch only that one, run `2 + 2` again, and read what appears."
  plan:
    - Catch only ValueError, by name
    - Run it and read the traceback that turns up
    - Fix the line the traceback points at
  shape: |
    try:
        answer = calculate(float(parts[0]), parts[1], float(___[2]))
        print(f"= {answer:.2f}")
    except ___:
        print("Those aren't both numbers.")
---
Run Caitlin's calculator, type `2 + 2`, then `quit`. It should print `= 4.00`.

`except Exception:` catches every error there is, including the ones nobody expected, and hides them behind one message. Catch the error you mean, by name, and see what was hiding.
