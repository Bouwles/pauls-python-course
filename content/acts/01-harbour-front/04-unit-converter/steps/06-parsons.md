---
id: parsons
type: parsons
title: Rain first
dialogue:
  - yahya: "Wet track, no run outside. Then we talk about the heat."
blocks:
  - { code: 'weather = input("Weather? ")', indent: 0 }
  - { code: 'temp = int(input("Temperature? "))', indent: 0 }
  - { code: 'if weather == "dry":', indent: 0 }
  - { code: "if temp < 30:", indent: 1 }
  - { code: 'print("Run outside")', indent: 2 }
  - { code: "else:", indent: 1 }
  - { code: 'print("Treadmill. Too hot.")', indent: 2 }
  - { code: "else:", indent: 0 }
  - { code: 'print("Treadmill. Wait for the rain to stop.")', indent: 1 }
check: run
hints:
  nudge: "Which does Yahya ask about first, the weather or the heat? The second question belongs inside the first."
  plan:
    - Ask for the weather and the temperature
    - Check the weather first
    - Only when it's dry, check the temperature
    - Otherwise, wait for the rain to stop
  shape: |
    weather = input("Weather? ")
    temp = int(input("Temperature? "))
    if weather == "dry":
        if ___:
            print("Run outside")
        else:
            print("Treadmill. Too hot.")
    else:
        print("Treadmill. Wait for the rain to stop.")
---
Yahya only runs outside when it's dry, and never at 30 degrees or more. Put the lines in order and indent them, so the temperature is only checked when the weather is `dry`.

There are two `else:` lines. Their indents decide which `if` each one belongs to.
