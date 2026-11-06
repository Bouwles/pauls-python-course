---
id: predict-copy
type: predict
title: How deep is a copy
concept: copying
code: |
  import copy

  standard = {"bread": {"sold": 0}}
  monday = standard.copy()
  tuesday = copy.deepcopy(standard)

  monday["bread"]["sold"] = 30
  tuesday["bread"]["sold"] = 12
  print(standard["bread"]["sold"])
question: What does this print?
options:
  - text: "0"
    misconception: copy-is-deep
    feedback: "`copy()` is shallow: a new outer dictionary, but the inner `{\"sold\": 0}` is shared. Monday's change reaches it."
  - text: "30"
    correct: true
    feedback: "`monday` shares its inner dictionary with `standard`. `tuesday` was copied all the way down, so its 12 stays its own."
  - text: "12"
    misconception: deepcopy-is-shallow
    feedback: "`deepcopy` copies everything inside, all the way down. Nothing Tuesday does can reach `standard`."
---
The standard bake, copied for two days: shallow for Monday, deep for Tuesday.
