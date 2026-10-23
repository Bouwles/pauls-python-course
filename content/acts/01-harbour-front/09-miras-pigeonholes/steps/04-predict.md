---
id: predict-negative
type: predict
title: From the other end
concept: negative-indices
code: |
  parcels = ["Bea", "Tom", "Agnes", "Gwen"]
  print(parcels[-1])
  print(parcels[-2])
question: What does this print?
options:
  - text: |-
      Gwen
      Agnes
    correct: true
    feedback: "Right. Negative indexes count from the end: -1 is the last item, -2 the one before it."
  - text: |-
      Agnes
      Tom
    misconception: negative-index-starts-at-zero
    feedback: "There's no -0. The last item is -1, so -2 is second from the end."
  - text: An error
    misconception: negative-index-error
    error: IndexError
    feedback: "Negative indexes are allowed. They count back from the end, and -1 is always the last item."
after: |
  Run it.
---
Mira often wants the newest parcel: the one on the end. You could work its index out from `len`. There is a shorter way.
