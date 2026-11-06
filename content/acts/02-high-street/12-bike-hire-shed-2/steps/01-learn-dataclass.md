---
id: learn-dataclass
type: learn
title: A class that writes itself
concept: dataclasses
code: |
  from dataclasses import dataclass


  @dataclass
  class Card:
      title: str
      author: str
      on_loan: bool = False


  first = Card("Carrying the Fire", "Michael Collins")
  print(first)
  print(first.title, first.on_loan)
---
A **dataclass** is a class that writes its own `__init__`. You list its **fields**, each with its type after a colon, and put `@dataclass` on the line above.

Neil's books are records, with a title, an author and a year each. Dataclasses are made for records.

From the fields, `@dataclass` writes an `__init__`, a way of printing that shows every field, and an `==` that compares the fields. A field with `=` has a default, and defaults go last. The example prints the whole card, then `Carrying the Fire False`.

`@dataclass` is a **decorator**: a line starting with `@` that changes what comes below it. A later project shows how they work.

The usual slip is to write an `__init__` as well. The dataclass already wrote one.
