---
id: investigate
type: investigate
title: Frozen
concept: dataclasses
code: |
  from dataclasses import dataclass, replace


  @dataclass(frozen=True)
  class Postcard:
      sender: str
      to: str
      message: str = ""


  card = Postcard("Ferro", "Truro", "Fair winds")
  print(card)
tasks:
  - id: try-to-change
    prompt: "Add `card.to = \"Tresco\"` at the bottom and run it. What kind of error is it? (The word before the colon on the last line.)"
    kind: answer
    accept: ["FrozenInstanceError", "dataclasses.FrozenInstanceError"]
    feedback: "FrozenInstanceError. `frozen=True` makes every field read-only once the postcard exists. Last August can't happen again."
    wrong: "Read the very last line of the traceback, up to the colon."
  - id: redirect
    prompt: "Take that line out. Make `moved`, a copy going to Tresco, with `moved = replace(card, to=\"Tresco\")`. Then print `moved.to`, and then `card.to`."
    kind: run
    tests: |
      TESTS = [
          output("Moved to Tresco, the original still Truro",
                 expect="Postcard(sender='Ferro', to='Truro', message='Fair winds')\nTresco\nTruro",
                 hint="Print moved.to first, then card.to."),
      ]
    solution: |
      from dataclasses import dataclass, replace


      @dataclass(frozen=True)
      class Postcard:
          sender: str
          to: str
          message: str = ""


      card = Postcard("Ferro", "Truro", "Fair winds")
      print(card)
      moved = replace(card, to="Tresco")
      print(moved.to)
      print(card.to)
  - id: default-message
    prompt: "Make `Postcard(\"Mira\", \"Bodmin\")` and print it. What is its `message`?"
    kind: answer
    accept: ["empty", "an empty string", "empty string", "nothing", "blank", "it's empty", "the empty string"]
    feedback: "An empty string, from `message: str = \"\"`. Fields with defaults go after the fields without, just like parameters."
    wrong: "Look between the quotes after `message=`."
---
`@dataclass(frozen=True)` makes a record that can't be changed after it's made.

To send a postcard somewhere else, you don't change the record: you make a new one. `replace()` copies a frozen record, changing only the fields you name.
