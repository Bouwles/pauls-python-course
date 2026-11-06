---
id: learn-argparse
type: learn
title: Let argparse read it
concept: argparse
code: |
  import argparse

  parser = argparse.ArgumentParser(description="Coffee for the class.")
  parser.add_argument("days", type=int)
  parser.add_argument("--cups", type=int, default=1)
  args = parser.parse_args(["3", "--cups", "2"])
  print(args.days, args.cups)
  print(f"{args.days * args.cups * 0.4:.1f} litres")
---
`argparse` reads the command line for you. You describe what the tool takes, and it does the reading, the converting and the complaining.

`add_argument("days")` is a plain argument, which must be given. A name starting with `--` is an **option**, which can be left out: `default=` fills the gap. `type=int` turns the text into a number. `parse_args()` reads what was typed and gives back an object with one attribute per argument, like `args.days`. Handed a list, as here, it reads that instead. The example prints `3 2`, then `2.4 litres`.

A missing or bad argument gets a usage message and exit code 2, and `--help` comes free.

The usual slip is with dashes in names. `--total-only` is read as `args.total_only`.
