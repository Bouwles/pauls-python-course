---
id: predict-counter
type: predict
title: Somebody else's tally
concept: counter
code: |
  from collections import Counter

  counts = Counter(["tea", "party", "tea", "hatter", "tea", "party"])
  print(counts["tea"], counts["dormouse"])
  print(counts.most_common(2))
question: What does this print?
options:
  - text: |-
      3 0
      [('tea', 3), ('party', 2)]
    correct: true
    feedback: "Right. A `Counter` gives 0 for something it never saw, and `most_common(2)` gives the two commonest as `(word, count)` pairs, commonest first."
  - text: A KeyError, because there's no dormouse
    misconception: counter-missing-raises
    error: KeyError
    feedback: "A plain dictionary would raise one. A `Counter` knows what it's for: anything it hasn't counted has been seen 0 times."
  - text: |-
      3 None
      [('tea', 3), ('party', 2)]
    misconception: counter-missing-is-none
    feedback: "Not seen means counted 0 times, so a `Counter` gives 0, a number you can add to."
  - text: |-
      3 0
      [('hatter', 1), ('party', 2)]
    misconception: most-common-alphabetical
    feedback: "`most_common` sorts by the count, biggest first. The words' spelling doesn't come into it."
---
`Counter`, from the `collections` module, counts a list for you. It gives back a kind of dictionary: each different item, with how many times it turned up.

Aaesha would do this with a spreadsheet. Lock in your answer, then run it.
