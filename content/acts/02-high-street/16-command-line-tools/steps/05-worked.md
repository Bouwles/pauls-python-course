---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "Neil's milk order. He wanted to work it out without coming down to ask me."
code: |
  import argparse
  import sys


  def main():
      parser = argparse.ArgumentParser(description="Milk for the Studio kettle.")
      parser.add_argument("days", type=int, help="how many days to cover")
      parser.add_argument("--people", type=int, default=1, help="people drinking tea")
      args = parser.parse_args()

      if args.days < 1:
          print("Days must be 1 or more.", file=sys.stderr)
          sys.exit(1)

      litres = args.days * args.people * 0.4
      print(f"{litres:.1f} litres of milk for {args.days} days")


  if __name__ == "__main__":
      main()
subgoals:
  - label: Describe the tool
    lines: [6, 6]
  - label: Say what it takes, with types and defaults
    lines: [7, 8]
  - label: Read what was typed
    lines: [9, 9]
  - label: "Refuse bad values: say why on sys.stderr, exit with 1"
    lines: [11, 13]
  - label: Do the job
    lines: [15, 16]
  - label: Run only when started as a program
    lines: [19, 20]
explain:
  prompt: "Why does Paul use `type=int` rather than calling `int()` on the text himself?"
  answer: "argparse does the converting, and if Neil types `three` it stops with a usage message and exit code 2 before Paul's code runs. Otherwise Paul would need his own try and except."
  concept: argparse
---
On a terminal, Neil types `python milk.py 3 --people 2` and gets `2.4 litres of milk for 3 days`.

Run it here with no arguments at all. Paul wrote none of the message you get: argparse did, and it finished with exit code 2, the usual code for "used wrongly". It writes `--help` too.

Messages about problems go to `sys.stderr`, a second output kept for trouble, so they never get mixed up with the results.
