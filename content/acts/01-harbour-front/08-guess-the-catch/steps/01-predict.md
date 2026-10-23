---
id: predict
type: predict
title: A number nobody chose
concept: imports
code: |
  catch = random.randint(1, 20)
  print(catch)
question: What happens when this runs?
verify: error
options:
  - text: It prints a number from 1 to 20
    misconception: modules-need-no-import
    feedback: "`random` isn't loaded until you ask for it. Without `import random` at the top, Python has never heard of it."
  - text: A NameError
    correct: true
    error: NameError
    feedback: "Right. `random` lives in a module, a file of extra tools, and Python only loads it when told to: `import random`."
  - text: A SyntaxError
    misconception: missing-import-is-syntax-error
    error: SyntaxError
    feedback: "The line is written correctly, so Python can read it. It only fails when it runs and meets a name it doesn't know."
after: |
  Run it, then read the last line of the traceback.
---
Gwen's game needs a number that nobody in the pub chose. Python has a tool for that: `random.randint(1, 20)` picks a whole number from 1 to 20.

Here is a first try at using it.
