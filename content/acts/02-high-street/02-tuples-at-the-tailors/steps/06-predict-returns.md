---
id: predict-returns
type: predict
title: Two answers at once
concept: multiple-returns
code: |
  def chest_and_waist():
      return 112, 98


  sizes = chest_and_waist()
  print(sizes)
question: What does this print?
options:
  - text: "(112, 98)"
    correct: true
    feedback: "`return 112, 98` hands back one tuple holding both numbers. `chest, waist = chest_and_waist()` would unpack it."
  - text: "112"
    misconception: return-gives-first-only
    feedback: "The comma matters. `return 112, 98` gives back both numbers, packed into one tuple."
  - text: "112 98"
    misconception: return-two-is-two-things
    feedback: "The two numbers don't arrive separately. They come back packed in one tuple, and `print` shows its brackets."
  - text: An error
    misconception: return-only-one-value
    feedback: "A function can give back several values. Separate them with commas and they travel together as a tuple."
---
A function that gives back two measurements at once. `sizes` keeps whatever comes back.
