---
id: predict-shadow
type: predict
title: Same name, two jobs
concept: modules
code: |
  import math

  for apples in [130, 45]:
      math = math.ceil(apples / 40)
      print(math, "crates")
question: What happens when this runs?
verify: error
options:
  - text: |-
      4 crates
      2 crates
    misconception: shadowing-module-harmless
    feedback: "Line 4 puts the number 4 in `math`. On the second pass, `math` is that number, not the module, and a number has no `ceil`."
  - text: |-
      4 crates
      then an AttributeError
    correct: true
    error: AttributeError
    feedback: "The first pass works, then gives the name `math` to the number 4. The second pass asks 4 for `.ceil`, and Python stops: an int has no attribute `ceil`."
  - text: An error on the first pass
    misconception: shadowing-module-harmless
    error: NameError
    feedback: "On the first pass `math` is still the module, so it works. The trouble starts once line 4 has given the name to a number."
---
Crates for the fruit order, 40 apples to a crate. Follow `math` through both passes.
