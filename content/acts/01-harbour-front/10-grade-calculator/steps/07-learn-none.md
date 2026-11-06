---
id: learn-none
type: learn
title: Nothing to hand back
concept: none
code: |
  def find_room(name):
      if name == "Paul":
          return "The Workshop"

  print(find_room("Paul"))
  room = find_room("Riya")
  print(room)
  print(room is None)
---
`None` is Python's word for no value at all. A function that finishes without reaching a `return` hands back `None`.

You can use it on purpose. Paul's `average` will return `None` for a paper with no marks on it, because there's no average to give.

`find_room` only returns for Paul. For anyone else it reaches the end with nothing to return, so the call gives `None`. To ask whether something is `None`, write `is None`: `room is None` is `True` or `False`. The example prints `The Workshop`, `None`, then `True`.

The usual slip is to expect `print(None)` to print nothing. It prints the word `None`. A stray `None` on screen usually means a function printed when it should have returned.
