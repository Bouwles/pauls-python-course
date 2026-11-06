---
id: predict-argparse
type: predict
title: argparse reads it for you
concept: argparse
code: |
  import argparse

  parser = argparse.ArgumentParser(description="Workshop jobs.")
  parser.add_argument("customer")
  parser.add_argument("--hours", type=float, default=1.0)

  args = parser.parse_args(["Yahya", "--hours", "2.5"])
  print(args.customer, args.hours * 2)
question: What does this print?
options:
  - text: Yahya 5.0
    correct: true
    feedback: "`customer` gets the plain word, `--hours` the word after it, and `type=float` turns that text into 2.5 before your code sees it."
  - text: Yahya 2.52.5
    misconception: argparse-gives-text
    feedback: "Without `type=`, it would be text. `type=float` tells argparse to convert it, so `args.hours` is the number 2.5."
  - text: Yahya 2.0
    misconception: default-always-used
    feedback: "The default only fills in when `--hours` isn't given. Here it is, so `args.hours` is 2.5."
---
A parser for Paul's repair hours. `parse_args` is handed the words as a list.
