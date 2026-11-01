---
id: make
type: make
title: Make the to-do tool
files: [todo.py]
entry: todo.py
argv_field: true
timeout_ms: 15000
on_pass: { paul.laughing: "Neil read my list. Then he added three more jobs, all for me." }
hints:
  nudge: "Each run starts from nothing but `todo.json`. What has to happen before a change is finished?"
  plan:
    - Describe the tool
    - "Say what it takes, with types and defaults: --file, then add, list and done"
    - Read what was typed
    - Do the job, and save the list if it changed
    - "Refuse bad values: say why on sys.stderr, exit with 1"
    - Run only when started as a program
  shape: |
    parser = argparse.ArgumentParser(description="Paul's to-do list.")
    parser.add_argument("--file", default=___)
    commands = parser.add_subparsers(dest="command", required=True)
    adding = commands.add_parser("add")
    adding.add_argument(___)
    listing = commands.add_parser("list")
    listing.add_argument("--open", action=___)
    finishing = commands.add_parser("done")
    finishing.add_argument("number", type=___)
    args = parser.parse_args()

    tasks = load(args.file)
    if args.command == "add":
        number = max([task["number"] for task in tasks], default=___) + 1
        ...
---
Write the to-do tool in `todo.py`. In the Arguments box, try `list`, then `add fix the clock` in quotes, then `done 3`, then `list` again: the changes are still there.

```
$ python todo.py list
1 [ ] rename x in grades.py
2 [x] mark the Act I tests
3 [ ] retrain the spam filter
```

`add_subparsers` gives a tool commands of its own, the way `git add` and `git log` work. Each `add_parser` is a small parser for one command, with its own arguments; `args.command` says which was used. `--file` belongs to the whole tool, so it comes before the command: `python todo.py --file home.json list`.
