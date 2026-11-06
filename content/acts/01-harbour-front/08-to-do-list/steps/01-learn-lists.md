---
id: learn-lists
type: learn
title: Many things, one name
concept: lists
code: |
  tasks = ["rocket poster", "album cover", "order ink"]
  print(tasks)
  print(len(tasks))
  empty = []
  print(len(empty))
---
A **list** keeps several values in one variable, in order. You write it between square brackets, with a comma between each item.

Riya's commissions are a list: one name for all of them, in the order people asked, however many there are.

`len(tasks)` gives the number of items in the list, its length. `[]` is an empty list, ready to fill, and its length is 0. Printing a list shows the brackets, and quotes round each piece of text. The example prints the list, then `3`, then `0`.

The usual slip is a missing comma. `["poster" "cover"]` isn't two items. Python glues the two pieces of text together into one item, `"postercover"`.
