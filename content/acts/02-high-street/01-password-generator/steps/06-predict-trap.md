---
id: predict-trap
type: predict
title: The default that remembers
concept: mutable-default
dialogue:
  - paul.unimpressed: "One more default. This one bites."
code: |
  def issue(name, register={}):
      register[name] = "issued"
      return register

  print(issue("Riya"))
  print(issue("Yahya"))
question: What does this print?
options:
  - text: |-
      {'Riya': 'issued'}
      {'Yahya': 'issued'}
    misconception: default-made-fresh-each-call
    feedback: "That's what it looks as if it should do. But the default dictionary is made once, when Python reads the `def` line, and every call without a register shares it."
  - text: |-
      {'Riya': 'issued'}
      {'Riya': 'issued', 'Yahya': 'issued'}
    correct: true
    feedback: "Right, and it surprises nearly everyone. There is one default dictionary, made when the function was defined. Every call that leaves out `register` adds to that same one."
  - text: |-
      {'Riya': 'issued', 'Yahya': 'issued'}
      {'Riya': 'issued', 'Yahya': 'issued'}
    misconception: later-line-changes-earlier-output
    feedback: "The first `print` ran before the second call. It showed the dictionary as it was at that moment."
after: |
  The fix is a default that can't be changed: `register=None`, then `if register is None: register = {}` inside the function. A new dictionary every call.
---
A default can be any value, a dictionary included. Read this one slowly before you answer.
