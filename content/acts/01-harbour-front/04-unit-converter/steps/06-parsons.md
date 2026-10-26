---
id: parsons
type: parsons
title: High water first
dialogue:
  - ferro: "No water, no crossing. Then we talk about the wind."
blocks:
  - { code: 'tide = input("Tide? ")', indent: 0 }
  - { code: 'wind = int(input("Wind in knots? "))', indent: 0 }
  - { code: 'if tide == "high":', indent: 0 }
  - { code: "if wind < 34:", indent: 1 }
  - { code: 'print("Sailing")', indent: 2 }
  - { code: "else:", indent: 1 }
  - { code: 'print("No sailing. Gale.")', indent: 2 }
  - { code: "else:", indent: 0 }
  - { code: 'print("No sailing. Wait for the tide.")', indent: 1 }
check: run
hints:
  nudge: "Which does Ferro ask about first, the tide or the wind? The second question belongs inside the first."
  plan:
    - Ask for the tide and the wind
    - Check the tide first
    - Only at high tide, check the wind
    - Otherwise, wait for the tide
  shape: |
    tide = input("Tide? ")
    wind = int(input("Wind in knots? "))
    if tide == "high":
        if ___:
            print("Sailing")
        else:
            print("No sailing. Gale.")
    else:
        print("No sailing. Wait for the tide.")
---
The ferry only sails at high tide, and never in a gale, which is 34 knots or more. Put the lines in order and indent them, so the wind is only checked when the tide is `high`.

There are two `else:` lines. Their indents decide which `if` each one belongs to.
