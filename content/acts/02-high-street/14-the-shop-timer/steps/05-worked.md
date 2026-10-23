---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Same shape as Sanjay's timer. I count instead of time."
code: |
  import functools

  calls = {}


  def counted(func):
      @functools.wraps(func)
      def wrapper(*args, **kwargs):
          calls[func.__name__] = calls.get(func.__name__, 0) + 1
          return func(*args, **kwargs)
      return wrapper


  @counted
  def plane(board):
      return board.strip()


  print(plane("  oak  "))
  print(plane(" ash"))
  print(calls)
  print(plane.__name__)
subgoals:
  - label: Take the function in
    lines: [6, 6]
  - label: Write a wrapper that accepts any arguments, and keep the name
    lines: [7, 8]
  - label: Do the extra job
    lines: [9, 9]
  - label: Call the original and hand back its result
    lines: [10, 10]
  - label: Return the wrapper
    lines: [11, 11]
  - label: Put it on with @
    lines: [14, 15]
explain:
  prompt: "What would `plane(\"  oak  \")` give back if line 10 had no `return`?"
  answer: "None. Calling `plane` now runs `wrapper`, and a function with no return gives back None. The planed board would be thrown away."
  concept: decorators
---
Moss counts how often he uses each tool. `wrapper` is a closure: it keeps hold of `func` long after `counted` has finished.

`*args, **kwargs` lets the wrapper take whatever the real function takes and pass it straight through. `functools.wraps` copies the real function's name onto the wrapper, so `plane` still calls itself `plane`.
