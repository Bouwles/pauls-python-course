---
id: learn-nested
type: learn
title: A record for each name
concept: nested-data
code: |
  book = {
      "Paul": {"phone": "01632 960101", "address": "The Workshop"},
      "Neil": {"phone": "01632 960245", "address": "The Puzzle Room"},
  }
  print(book["Neil"]["address"])
  record = book["Paul"]
  print(f"Paul: {record['phone']}")
---
A dictionary's values can be dictionaries too. Each contact in Riya's book will be a small dictionary of its own, a **record**, with a `phone` and an `address`.

That way one name holds several details, and every record has the same keys.

Read `book["Neil"]["address"]` from the left: `book["Neil"]` is Neil's record, and `["address"]` looks inside it. The example prints `The Puzzle Room`, then `Paul: 01632 960101`.

Inside an f-string written with double quotes, put the key in single quotes, `record['phone']`. Another double quote would end the text early.

The usual slip is to look for `book["address"]`. `address` is a key of each record, not of the book.
