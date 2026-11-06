---
id: learn-get
type: learn
title: A name that might not be there
concept: dict-get
code: |
  rooms = {"Paul": "The Workshop", "Yahya": "The Archive"}
  print(rooms.get("Riya", "Not in the book"))
  print(rooms.get("Yahya", "Not in the book"))
  print("Paul" in rooms)
---
Looking up a key that isn't there, like `rooms["Riya"]`, stops the program with a **KeyError**. `.get()` asks more carefully.

Riya's book will be asked for names it doesn't have yet, and it mustn't crash when it is.

`rooms.get("Riya", "Not in the book")` gives Riya's value if she's a key, and `"Not in the book"` if she isn't. Leave out the second value and a missing key gives `None`, Python's word for no value at all. `"Paul" in rooms` asks whether Paul is a key: `True` or `False`.

The example prints `Not in the book`, `The Archive`, then `True`.

The usual slip is to expect `rooms["Riya"]` to give a blank. It crashes. Add `print(rooms["Riya"])` at the end and run it to see.
