---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "The Local round, in one line. Only the questions Gwen wants. Very efficient."
  - pip: "It says it expected an else. I don't want an else. I want fewer questions."
dialogue_after:
  - pip: "So the front if picks what to write, and the end if picks what to keep. Typical."
hints:
  nudge: "Pip wants to keep only some questions. Where does an `if` go when it decides which items get in?"
  plan:
    - Read where the SyntaxError points
    - Decide whether this if chooses a value or keeps some items
    - Move the if to the end
  shape: |
    local = [question["question"] for question in questions ___ question["round"] == "Local"]
---
Pip's program should print the four questions in the Local round. Run it and read the error.

Keep it a comprehension. The fix is moving a few words, not adding more.
