---
id: learn-mutability
type: learn
title: What can change
concept: mutability
code: |
  buns = 60
  count = buns
  count = count - 12
  print(buns, count)

  name = "bread"
  shout = name.upper()
  print(name, shout)
---
Lists, dictionaries and sets can be changed in place: they're **mutable**. Every label on one sees the change.

Numbers, strings and tuples can't be changed at all: they're **immutable**. Anything that looks like a change makes a new value instead. `count = count - 12` works out 48, a new number, and moves the `count` label onto it. `buns` stays on 60.

So two names on one number can never trouble each other. Two names on one dictionary can, and Caitlin's sheets are dictionaries.

The example prints `60 48`, then `bread BREAD`: `.upper()` made a new string and left `name` alone.

The usual slip is to expect `count` and `buns` to stay linked. With numbers, they never were.
