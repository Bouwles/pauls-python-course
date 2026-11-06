---
id: learn-dict
type: learn
title: Names to details
concept: dictionaries
code: |
  rooms = {"Paul": "The Workshop", "Yahya": "The Archive"}
  print(rooms["Yahya"])
  rooms["Neil"] = "The Puzzle Room"
  print(rooms)
  print(len(rooms))
---
A **dictionary** pairs **keys** with **values**, so you can look a value up by its key. Here the keys are names and the values are rooms.

It's how Riya's book will work: type a name, get the details. A list finds things by position. A dictionary finds them by key.

You write it in curly brackets, with a colon between each key and its value. `rooms["Yahya"]` looks up Yahya. `rooms["Neil"] = "The Puzzle Room"` adds Neil. `len(rooms)` counts the keys. The example prints `The Archive`, the whole dictionary, then `3`.

The usual slip is to expect a key to hold two values. Each key appears once. Give an existing key a new value, and the old one is replaced.
