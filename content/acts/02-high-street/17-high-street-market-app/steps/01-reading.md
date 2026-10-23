---
id: plan
type: reading
title: Mark it out first
dialogue:
  - moss: "Before you cut, mark it out. Four pieces, each with one job."
---
A program this size doesn't go in one file. Split it by what each part is for, so you can change one without breaking the others.

```
stalls.py       the rules          imports nothing of yours
storage.py      the files          imports stalls
cli.py          the command line   imports stalls and storage
test_market.py  your tests         imports stalls
```

The imports only point one way. `stalls.py` doesn't know files or terminals exist, which is exactly why it's easy to test: make a `Market`, book things, check what comes back. Nothing to open, nothing to type.

Build it in that order. Each step adds one file and its checks, and the files you've already written come with you. If a later step shows up a bug in an earlier file, fix it there; the fix comes along too.
