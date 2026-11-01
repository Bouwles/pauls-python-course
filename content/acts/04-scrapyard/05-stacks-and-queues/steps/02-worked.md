---
id: worked
type: worked
title: How Paul checks the brackets
dialogue:
  - paul.thinking: "One bracket out of place and nothing runs. Python counts them. So can we."
code: |
  PARTNERS = {")": "(", "]": "[", "}": "{"}


  def balanced(text):
      still_open = []
      for character in text:
          if character in "([{":
              still_open.append(character)
          elif character in PARTNERS:
              if not still_open or still_open.pop() != PARTNERS[character]:
                  return False
      return not still_open


  print(balanced("round(prices[2]) {total}"))
  print(balanced("round(prices[2)]"))
  print(balanced("round((prices)"))
subgoals:
  - label: A stack for the brackets still open
    lines: [5, 5]
  - label: "An opener: push it"
    lines: [7, 8]
  - label: "A closer: nothing open, or the wrong kind on top, is a mistake"
    lines: [9, 11]
  - label: At the end, anything still open is a mistake
    lines: [12, 12]
explain:
  prompt: "Why can't Paul just count, adding one for every opener and taking one off for every closer?"
  answer: "A count knows how many brackets are open, not which kinds or in what order. In `round(prices[2)]` it goes up to two and back to nought, but the `)` closes a `[`. Only the top of the stack says which bracket a closer has to match."
  concept: stacks
---
Every bracket in a line of code has to be closed by the same kind, and the most recently opened one has to close first. That's a stack's order exactly: last in, first out.

`not still_open` is `True` when the list is empty, since an empty list counts as false.

Press Step through. `still_open` is drawn as a row of boxes: the right-hand end is the top of the stack.
