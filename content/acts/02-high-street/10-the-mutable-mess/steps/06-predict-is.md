---
id: predict-is
type: predict
title: Same, or the same one
concept: is-vs-equals
code: |
  friday = [40, 30]
  saturday = [40, 30]
  sheet = friday
  print(friday == saturday)
  print(friday is saturday)
  print(friday is sheet)
question: What does this print?
options:
  - text: |-
      True
      False
      True
    correct: true
    feedback: "`friday` and `saturday` hold the same numbers but are two lists. `sheet` is a second label on `friday`'s list."
  - text: |-
      True
      True
      True
    misconception: equal-means-same-object
    feedback: "`==` asks whether two lists hold the same things. `is` asks whether they are the same list. Two lists can hold the same numbers and still be two lists."
  - text: |-
      False
      False
      True
    misconception: equals-checks-identity
    feedback: "`==` compares what's inside. Both lists hold 40 and 30, so they are equal, even though they are different lists."
  - text: |-
      True
      False
      False
    misconception: is-compares-names
    feedback: "`is` doesn't care about names. `sheet = friday` put two labels on one list, so `friday is sheet` is True."
---
Two sales sheets as lists, and a third name.
