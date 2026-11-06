---
id: predict-offer
type: predict
title: A function that remembers
concept: closures
code: |
  def make_offer(percent):
      def apply(price):
          return round(price * (100 - percent) / 100, 2)
      return apply


  half_price = make_offer(50)
  tenth_off = make_offer(10)
  print(half_price(3.00))
  print(tenth_off(3.00))
question: What does this print?
options:
  - text: |-
      1.5
      2.7
    correct: true
    feedback: "Each call to `make_offer` makes a fresh `percent` and a fresh `apply` that keeps hold of it. Half price remembers 50; tenth off remembers 10."
  - text: "A NameError: percent is gone once make_offer has finished"
    misconception: inner-function-forgets-outer
    error: NameError
    feedback: "An inner function keeps the outer function's variables it uses, even after the outer one has returned. That's what makes it a closure."
  - text: |-
      2.7
      2.7
    misconception: closures-share-last-value
    feedback: "The second call doesn't overwrite the first. Every call to `make_offer` gets its own `percent`, so the two offers stay different."
---
The fruit table's offers change every week, so `make_offer` builds a new pricing function for each one.
