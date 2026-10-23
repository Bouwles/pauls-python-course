---
id: predict-trap
type: predict
title: The default that remembers
concept: mutable-default
dialogue:
  - moss: "One more default. This one bites."
code: |
  def add_order(item, basket=[]):
      basket.append(item)
      return basket

  print(add_order("bread"))
  print(add_order("buns"))
question: What does this print?
options:
  - text: |-
      ['bread']
      ['buns']
    misconception: default-made-fresh-each-call
    feedback: "That's what it looks as if it should do. But the default list is made once, when Python reads the `def` line, and every call without a basket shares it."
  - text: |-
      ['bread']
      ['bread', 'buns']
    correct: true
    feedback: "Right, and it surprises nearly everyone. There is one default list, made when the function was defined. Every call that leaves out `basket` appends to that same list."
  - text: |-
      ['bread', 'buns']
      ['bread', 'buns']
    misconception: later-line-changes-earlier-output
    feedback: "The first `print` ran before the second call. It showed the list as it was at that moment."
---
A default can be any value, a list included. Read this one slowly before you answer.
