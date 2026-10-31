---
id: plan
type: reading
title: Mark it out first
dialogue:
  - paul: "Before you build, mark it out. Four pieces, each with one job."
---
A program this size doesn't go in one file. Split it by what each part is for, so you can change one without breaking the others.

```
money.py        the rules          imports nothing of yours
storage.py      the file           imports money
cli.py          the command line   imports money and storage
test_money.py   your tests         imports money
```

The imports only point one way. `money.py` doesn't know files or terminals exist, which is exactly why it's easy to test: make a `Ledger`, add things, check what comes back. Nothing to open, nothing to type.

Build it in that order. Each step adds one file and its checks, and the files you've already written come with you. If a later step shows up a bug in an earlier file, fix it there; the fix comes along too. At the end, you'll take it home and make it a proper package.
