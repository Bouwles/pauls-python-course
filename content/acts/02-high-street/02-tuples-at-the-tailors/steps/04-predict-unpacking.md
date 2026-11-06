---
id: predict-unpacking
type: predict
title: One name short of a value
concept: unpacking
code: |
  size = (96, 88)
  chest, waist, leg = size
  print(leg)
question: What happens when this runs?
verify: error
options:
  - text: It prints None
    misconception: unpack-count-flexible
    feedback: "Unpacking never fills a gap with `None`. Three names need exactly three values."
  - text: It prints 88
    misconception: unpack-count-flexible
    feedback: "The values go to the names in order: 96 to `chest`, 88 to `waist`. Nothing is left for `leg`, and Python won't leave it empty."
  - text: A ValueError on line 2
    correct: true
    error: ValueError
    feedback: "Three names, two values: not enough values to unpack. It's one name for each value, no more and no fewer."
---
Mae Grant sent her chest and waist, and forgot her leg.
