---
id: predict-star-args
type: predict
title: The size goes where
concept: args-kwargs
code: |
  def kit(*names, size="M"):
      for name in names:
          print(name, size)

  kit("Neil", "Riya", "L")
question: What does this print?
options:
  - text: |-
      Neil M
      Riya M
      L M
    correct: true
    feedback: "Every unnamed argument goes into `names`, and `\"L\"` is unnamed. To change the size, name it: `kit(\"Neil\", \"Riya\", size=\"L\")`."
  - text: |-
      Neil L
      Riya L
    misconception: positional-reaches-keyword-only
    feedback: "`size` comes after `*names`, so an unnamed argument can never reach it. `\"L\"` lands in `names` with the others."
  - text: An error, because there are too many arguments
    misconception: star-args-takes-one
    error: TypeError
    feedback: "`*names` takes as many unnamed arguments as the call gives, so there are never too many for it."
---
Caitlin orders the five-a-side kit. Everyone gets size M unless she says otherwise.
