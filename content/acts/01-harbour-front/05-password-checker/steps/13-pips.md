---
id: pips
type: pips
title: Fix Aaesha's version
dialogue:
  - aaesha.pleased: "I wrote the letters rule first. I checked each half of it on its own. Both right."
  - aaesha.confused: "Then I typed clocktower1987 and it said the letters were fine. They aren't. Can you look?"
dialogue_after:
  - aaesha.thinking.think: "Either one missing is enough to fail. So it's or. The rule said and. One word, in the test."
hints:
  nudge: "Take `clocktower1987`. What are `has_capital` and `has_lower`? Does the password fail when one of them is missing, or only when both are?"
  plan:
    - Run it with clocktower1987 and read the answer
    - Work out each side of the test for that password
    - Use the operator that fails the password when either one is missing
  shape: |
    if not has_capital ___ not has_lower:
        print("Needs capitals and lower case.")
    else:
        print("Letters fine.")
---
Aaesha's version checks only the letters rule: a password needs at least one capital and at least one lower-case letter. `has_capital` and `has_lower` each hold a bool, the answer to a question, kept for later.

Run it and type `clocktower1987`. It should print `Needs capitals and lower case.` Work out why it doesn't, then fix it.
