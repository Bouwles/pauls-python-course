---
id: parsons
type: parsons
title: Rain first
dialogue:
  - neil.thinking.think: "Wet track, wet tyres. Only when it's dry do we talk about the heat."
blocks:
  - { code: 'track = input("Track? ")', indent: 0 }
  - { code: 'temp = int(input("Track temperature? "))', indent: 0 }
  - { code: 'if track == "dry":', indent: 0 }
  - { code: "if temp < 40:", indent: 1 }
  - { code: 'print("Soft tyres")', indent: 2 }
  - { code: "else:", indent: 1 }
  - { code: 'print("Hard tyres. Too hot for softs.")', indent: 2 }
  - { code: "else:", indent: 0 }
  - { code: 'print("Wet tyres. Whatever the temperature.")', indent: 1 }
check: run
hints:
  nudge: "Which does Neil ask about first, the track or the heat? The second question belongs inside the first."
  plan:
    - Ask about the track and its temperature
    - Check the track first
    - Only when it's dry, check the temperature
    - Otherwise, wet tyres
  shape: |
    track = input("Track? ")
    temp = int(input("Track temperature? "))
    if track == "dry":
        if ___:
            print("Soft tyres")
        else:
            print("Hard tyres. Too hot for softs.")
    else:
        print("Wet tyres. Whatever the temperature.")
---
Neil picks tyres the way a race team does. A wet track gets wet tyres. A dry track gets softs, unless the track is 40 degrees or more, when softs wear out too fast. Put the lines in order and indent them, so the temperature is only checked when the track is `dry`.

There are two `else:` lines. Their indents decide which `if` each one belongs to.
