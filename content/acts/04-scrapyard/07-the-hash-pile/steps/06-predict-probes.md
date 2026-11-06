---
id: predict-probes
type: predict
title: Along one pile
concept: hash-maps
code: |
  def probes_to_find(pile, name):
      probes = 0
      for stored, count in pile:
          probes = probes + 1
          if stored == name:
              return probes
      return probes


  pile = [("disc", 6), ("pin", 9), ("shim", 5)]
  print(probes_to_find(pile, "pin"))
  print(probes_to_find(pile, "rod"))
question: What does this print?
options:
  - text: |-
      2
      3
    correct: true
    feedback: "Right. `pin` is the second pair, so two probes. `rod` isn't there, and only after comparing all three names can the pile say so."
  - text: |-
      2
      0
    misconception: missing-costs-nothing
    feedback: "A missing name isn't free. Every name in its pile has to be compared before the map can say it isn't there: three probes here."
  - text: |-
      1
      1
    misconception: hash-lookup-one-probe
    feedback: "The hash only picks the pile. Inside it, names are compared one at a time, so `pin`, second in the pile, takes two probes."
---
One pile with three parts in it, after three names collided there.
