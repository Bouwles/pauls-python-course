---
id: learn-enum
type: learn
title: A fixed set of choices
concept: enums
code: |
  from enum import Enum


  class Tyre(Enum):
      SOFT = "soft"
      WET = "wet"


  choice = Tyre.WET
  print(choice)
  print(choice.value)
  print(choice == Tyre.WET, choice == "wet")
---
An **Enum** is a fixed set of named choices. `class Tyre(Enum):` lists them, and each **member** has a name, `WET`, and a value, `"wet"`.

A book on Neil's shelves is on the shelf or on loan, never anything else. With a string, `"on lone"` would be a typo that quietly never matches. With an Enum, a misspelt member like `Tyre.WTE` is an error the first time the line runs.

`.value` gets a member's value. The example prints `Tyre.WET`, then `wet`, then `True False`.

The usual slip is to compare a member with text. `Tyre.WET == "wet"` is `False`, and nothing complains. Compare members with members: `choice == Tyre.WET`.
