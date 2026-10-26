---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Ferro's calculator. Nothing can crash it. I caught everything."
  - pip: "He typed 2 + 2 and it said they weren't both numbers. I think the captain typed it wrong."
dialogue_after:
  - pip: "So the except was catching my typo and blaming Ferro. That's quite rude of it."
hints:
  nudge: "Which error did Pip mean to catch? Catch only that one, run `2 + 2` again, and read what appears."
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
Run Pip's calculator, type `2 + 2`, then `quit`. It should print `= 4.00`.

`except Exception:` catches every error there is, including the ones nobody expected, and hides them behind one message. Catch the error you mean, by name, and see what was hiding.
