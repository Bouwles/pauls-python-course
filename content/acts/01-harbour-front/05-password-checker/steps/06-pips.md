---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "The rule says capitals and lower case. So I wrote not capitals and not lower case."
  - pip: "Agnes typed harbour1987. It says the letters are fine. Agnes says they are not."
dialogue_after:
  - pip: "Either one missing is enough to fail. So it's or. The rule said and. English is a trap."
hints:
  nudge: "Take `harbour1987`. What are `has_capital` and `has_lower`? Does the password fail when one of them is missing, or only when both are?"
  plan:
    - Run it with harbour1987 and read the answer
    - Work out each side of the test for that password
    - Use the operator that fails the password when either one is missing
  shape: |
    if not has_capital ___ not has_lower:
        print("Needs capitals and lower case.")
    else:
        print("Letters fine.")
---
Pip's version only checks the letters. A password needs at least one capital and at least one lower-case letter.

`has_capital` holds a bool: the answer to a question, kept for later.

Run it with `harbour1987`. It should print `Needs capitals and lower case.` Find out why it doesn't, then fix it.
