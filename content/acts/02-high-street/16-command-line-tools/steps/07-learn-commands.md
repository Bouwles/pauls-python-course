---
id: learn-commands
type: learn
title: Commands of its own
concept: argparse
code: |
  import argparse

  parser = argparse.ArgumentParser(description="Paul's to-do list.")
  commands = parser.add_subparsers(dest="command", required=True)
  adding = commands.add_parser("add")
  adding.add_argument("task")
  listing = commands.add_parser("list")
  listing.add_argument("--open", action="store_true")

  print(parser.parse_args(["add", "fix the clock"]))
  print(parser.parse_args(["list", "--open"]))
  print(parser.parse_args(["list"]))
---
Some tools have commands of their own, the way `git add` and `git log` do. Paul's will have `add`, `list` and `done`.

`parser.add_subparsers(dest="command")` makes room for them. Each `commands.add_parser("add")` is a small parser for one command, with arguments of its own, and `args.command` says which command was used.

`action="store_true"` makes a **flag**: `--open` on its own, with no value after it. It's `True` when it's typed and `False` when it isn't. The example prints what each line reads, ending `Namespace(command='list', open=False)`.

The usual slip is with options for the whole tool, like `--file`. They go before the command: `python todo.py --file home.json list`.
