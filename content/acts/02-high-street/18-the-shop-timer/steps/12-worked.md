---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral: "Same shape as the timer you're about to write. I count instead of time."
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
Paul counts how often he uses each tool in the Workshop, with a decorator the same shape as the timer you're about to write.

Two new pieces. `*args, **kwargs` in the wrapper takes whatever the real function takes and passes it straight through, so `counted` fits any function. `@functools.wraps(func)` copies the real function's name onto the wrapper, so `plane` still calls itself `plane`: the last line prints it.

The labels beside the code are the steps he took. They're the comments in your file.
