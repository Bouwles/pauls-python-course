---
id: learn-dict-loop
type: learn
title: Every name in the book
concept: dict-items
code: |
  rooms = {"Paul": "The Workshop", "Yahya": "The Archive", "Neil": "The Puzzle Room"}
  for name in rooms:
      print(name)
  for name, room in rooms.items():
      print(f"{name} is in {room}")
---
A `for` loop over a dictionary gives you its keys, one per pass, in the order they went in.

That's how Riya's book will search: go through every name and check each one.

To get the values too, loop over `rooms.items()`. It hands you each key and its value together, so `for name, room in rooms.items():` puts the key in `name` and the value in `room`. The example prints the three names, then a line for each, like `Paul is in The Workshop`.

The usual slip is to expect the plain loop to give the values. It gives the keys. Inside it, `rooms[name]` looks up each value.
