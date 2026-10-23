---
id: parsons
type: parsons
title: High water first
dialogue:
  - ferro: "No water, no crossing. Then we talk about the clock."
blocks:
  - { code: 'tide = input("Tide? ")', indent: 0 }
  - { code: 'hour = int(input("Hour? "))', indent: 0 }
  - { code: 'if tide == "high":', indent: 0 }
  - { code: "if hour < 7 or hour >= 19:", indent: 1 }
  - { code: 'print("Night crossing")', indent: 2 }
  - { code: "else:", indent: 1 }
  - { code: 'print("Day crossing")', indent: 2 }
  - { code: "else:", indent: 0 }
  - { code: 'print("No crossing. Wait for the tide.")', indent: 1 }
check: run
hints:
  nudge: "Which question does Ferro ask first, the tide or the clock? The second one belongs inside the first."
  plan:
    - Ask for the tide and the hour
    - Check the tide first
    - Only at high tide, decide between night and day
    - Otherwise, wait for the tide
  shape: |
    tide = input("Tide? ")
    hour = int(input("Hour? "))
    if tide == "high":
        if ___:
            print("Night crossing")
        else:
            print("Day crossing")
    else:
        print("No crossing. Wait for the tide.")
---
The ferry only sails at high tide. Put the lines in order and indent them, so the clock is only checked when the tide is `high`.

There are two `else:` lines. Their indents decide which `if` each one belongs to.
