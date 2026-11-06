---
id: investigate-brackets
type: investigate
title: Brackets on a stack
concept: stacks
dialogue:
  - paul.thinking: "One bracket out of place and nothing runs. Python checks them with a stack. So can we."
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
tasks:
  - id: how-many
    prompt: "Run it. How many of the three lines are balanced?"
    kind: answer
    accept: ["1", "one", "just one", "only one", "the first", "the first one"]
    feedback: "One, the first. The second closes a `[` with a `)`. The third leaves a `(` open at the end."
    wrong: "Count the lines that print True."
  - id: on-top
    prompt: "In `round(prices[2)]`, which bracket is on top of the stack when the `)` arrives?"
    kind: answer
    accept: ["[", "the [", "square", "a square bracket", "the square bracket", "["]
    feedback: "`[`, the latest one opened. A `)` has to close a `(`, so the function returns `False` there and then."
    wrong: "Push each opener as you read along: `(`, then `[`. Which is on top?"
  - id: angles
    prompt: "Make it check angle brackets too: add `\">\": \"<\"` to `PARTNERS` and `<` to the openers on line 7. Then `balanced(\"list<int>\")` is `True`, and `balanced(\"list<int\")`, with the `<` never closed, is `False`."
    kind: run
    tests: |
      TESTS = [
          function("Angle brackets that close", call="balanced", args=("list<int>",), expect=True,
                   hint="Line 7 needs < in its string of openers, and PARTNERS needs the pair \">\": \"<\"."),
          function("An angle bracket never closed", call="balanced", args=("list<int",), expect=False,
                   hint="Once < is an opener, it's pushed, and anything still open at the end is a mistake."),
          function("An angle bracket closed by a round one", call="balanced", args=("f(list<int)>",), expect=False),
          function("The old ones still work", call="balanced", args=("round(prices[2]) {total}",), expect=True),
      ]
    solution: |
      PARTNERS = {")": "(", "]": "[", "}": "{", ">": "<"}


      def balanced(text):
          still_open = []
          for character in text:
              if character in "([{<":
                  still_open.append(character)
              elif character in PARTNERS:
                  if not still_open or still_open.pop() != PARTNERS[character]:
                      return False
          return not still_open


      print(balanced("round(prices[2]) {total}"))
      print(balanced("round(prices[2)]"))
      print(balanced("round((prices)"))
---
Paul's bracket checker. Each opener is pushed. Each closer pops the top one, which must be its partner. At the end, nothing may be left open.

`not still_open` is `True` when the list is empty, since an empty list counts as false. Press Step through: the right-hand end of `still_open` is the top.
