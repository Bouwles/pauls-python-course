---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Old Tom's lamp oil. He wanted to work it out without walking down here."
code: |
  import argparse
  import sys


  def main():
      parser = argparse.ArgumentParser(description="Lamp oil for the lighthouse.")
      parser.add_argument("nights", type=int, help="how many nights to cover")
      parser.add_argument("--wicks", type=int, default=1, help="wicks lit")
      args = parser.parse_args()

      if args.nights < 1:
          print("Nights must be 1 or more.", file=sys.stderr)
          sys.exit(1)

      litres = args.nights * args.wicks * 0.4
      print(f"{litres:.1f} litres of oil for {args.nights} nights")


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
  prompt: "Why does Moss use `type=int` rather than calling `int()` on the text himself?"
  answer: "argparse does the converting, and if Tom types `three` it stops with a usage message and exit code 2 before Moss's code runs. Otherwise Moss would need his own try and except."
  concept: argparse
---
On a terminal, Tom types `python oil.py 3 --wicks 2` and gets `2.4 litres of oil for 3 nights`.

Run it here with no arguments at all. Moss wrote none of the message you get: argparse did, and it finished with exit code 2, the usual code for "used wrongly". It writes `--help` too.

Messages about problems go to `sys.stderr`, a second output kept for trouble, so they never get mixed up with the results.
