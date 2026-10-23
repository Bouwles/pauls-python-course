---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Bea's cake boxes. Same idea, smaller labels."
code: |
  def box_label(cake, customer="Counter", **extras):
      """Return the label for a cake box: the cake, who it is for, then any extras."""
      lines = [f"{cake.upper()} for {customer}"]
      for name, value in extras.items():
          lines.append(f"{name}: {value}")
      return "\n".join(lines)


  print(box_label("lardy cake", customer="Gwen", candles=11, message="Same quiz, new year"))
  print(box_label("bun"))
subgoals:
  - label: Say what it does, in a docstring
    lines: [2, 2]
  - label: Start with the line every label has
    lines: [3, 3]
  - label: Add one line per extra
    lines: [4, 5]
  - label: Join the lines and return them
    lines: [6, 6]
  - label: Call it, naming the optional parts
    lines: [9, 10]
explain:
  prompt: "In the second call, what is `extras`, and what does the loop do?"
  answer: "An empty dictionary. The loop runs zero times, so the label is only its first line: `BUN for Counter`."
  concept: args-kwargs
---
A string on the first line inside a `def` is a **docstring**. `help(box_label)` shows it, so whoever calls the function never has to read the body. Say what goes in and what comes back.

`**extras` gathers the keyword arguments that match no parameter into a dictionary, in the order they were given.
