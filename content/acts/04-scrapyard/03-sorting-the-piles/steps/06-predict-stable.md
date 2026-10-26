---
id: predict-stable
type: predict
title: Three parts at four kilos
concept: sort-stability
code: |
  parts = [("hubcap", 4), ("kettle", 2), ("spring", 4), ("gear", 1), ("anvil", 4)]
  by_weight = sorted(parts, key=lambda part: part[1])
  for name, weight in by_weight:
      print(name, weight)
question: What does this print?
options:
  - text: |-
      gear 1
      kettle 2
      hubcap 4
      spring 4
      anvil 4
    correct: true
    feedback: "Right. The key is only the weight, so the three 4 kg parts tie, and they stay in the order they arrived: hubcap, spring, anvil."
  - text: |-
      gear 1
      kettle 2
      anvil 4
      hubcap 4
      spring 4
    misconception: ties-sorted-by-rest
    feedback: "The key is only the weight. Nothing looks at the names, so a tie isn't broken alphabetically. The three keep the order they came in."
  - text: The three 4 kg parts could come out in any order
    misconception: ties-come-out-any-order
    feedback: "Python's sort always keeps tied items in the order they started in. Same pile in, same order out, every time."
after: |
  Run it. A sort that keeps ties in their old order is called **stable**, and Python's is. Now sort `parts` by name first, then sort that by weight. Look at the 4 kg parts.
---
The merchant wants the parts lightest first. Three of these weigh 4 kg. The question is what happens to those three.
