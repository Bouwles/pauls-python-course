---
id: predict-stable
type: predict
title: Three laps at four tenths
concept: sort-stability
dialogue:
  - neil.thinking: "Same time to the tenth? In qualifying, whoever set it first goes ahead."
code: |
  laps = [("Caitlin", 4), ("Neil", 2), ("Yahya", 4), ("Riya", 1), ("Aaesha", 4)]
  fastest_first = sorted(laps, key=lambda lap: lap[1])
  for driver, tenths in fastest_first:
      print(driver, tenths)
question: What does this print?
options:
  - text: |-
      Riya 1
      Neil 2
      Caitlin 4
      Yahya 4
      Aaesha 4
    correct: true
    feedback: "Right. The key is only the time, so the three laps at four tenths tie, and they stay in the order they were set: Caitlin, Yahya, Aaesha."
  - text: |-
      Riya 1
      Neil 2
      Aaesha 4
      Caitlin 4
      Yahya 4
    misconception: ties-sorted-by-rest
    feedback: "The key is only the time. Nothing looks at the names, so a tie isn't broken alphabetically. The three keep the order they came in."
  - text: The three laps at four tenths could come out in any order
    misconception: ties-come-out-any-order
    feedback: "Python's sort always keeps tied items in the order they started in. Same pile in, same order out, every time."
after: |
  Run it. Then sort `laps` by name first, and sort that by time. Look at the laps at four tenths: now they're in name order, because that's the order they came in.
---
One qualifying session on Neil's sim rig, in the order the laps were set. Three of these laps are four tenths off.
