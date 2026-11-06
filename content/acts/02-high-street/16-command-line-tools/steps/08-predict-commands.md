---
id: predict-commands
type: predict
title: Done, number three
concept: argparse
code: |
  import argparse

  parser = argparse.ArgumentParser()
  parser.add_argument("--file", default="todo.json")
  commands = parser.add_subparsers(dest="command", required=True)
  finishing = commands.add_parser("done")
  finishing.add_argument("number", type=int)

  args = parser.parse_args(["done", "3"])
  print(args.command, args.number + 1, args.file)
question: What does this print?
options:
  - text: done 4 todo.json
    correct: true
    feedback: "`args.command` is the command's name, `type=int` made the number a number, and `--file` wasn't typed, so it took its default."
  - text: done 31 todo.json
    misconception: argparse-gives-text
    feedback: "`type=int` turns `\"3\"` into the number 3 before your code sees it, so adding 1 gives 4."
  - text: done 4 None
    misconception: left-out-option-is-none
    feedback: "`--file` wasn't typed, so it gets its default, `todo.json`. It would only be `None` with no default at all."
---
Paul ticks off task 3.
