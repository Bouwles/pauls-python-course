---
id: predict-import
type: predict
title: A number nobody chose
concept: imports
code: |
  secret = random.randint(1, 100)
  print(secret)
question: What happens when this runs?
verify: error
options:
  - text: It prints a number from 1 to 100
    misconception: modules-need-no-import
    feedback: "`random` is a module, and a module isn't loaded until you ask for it. Without `import random` at the top, Python has never heard of it."
  - text: A NameError
    correct: true
    error: NameError
    feedback: "Line 1 uses `random`, but nothing loaded it. Adding `import random` as the first line fixes it."
  - text: A SyntaxError
    misconception: missing-import-is-syntax-error
    error: SyntaxError
    feedback: "The line is written correctly, so Python can read it. It only fails when it runs and meets a name it doesn't know, and that's a NameError."
---
`random.randint(1, 100)` uses the `randint` tool in the `random` module to pick a number for Caitlin's game. Look at what's at the top of this file.
