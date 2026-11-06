---
id: learn-comprehension
type: learn
title: A list made from a list
concept: list-comprehensions
code: |
  answers = ["Time", " six", "QUARTET "]
  tidy = [answer.strip().lower() for answer in answers]
  print(tidy)

  lengths = [len(answer) for answer in tidy]
  print(lengths)
---
A **list comprehension** builds a new list from an old one in a single line. `[answer.lower() for answer in answers]` means: `answer.lower()`, for each `answer` in `answers`.

It replaces a loop that starts with an empty list and appends to it. Most of Caitlin's quiz is lists made from lists.

The part before `for` is worked out once for every item, and each result goes into the new list, in order. The old list isn't changed. The example prints `['time', 'six', 'quartet']`, then `[4, 3, 7]`.

Use one to build a list. To print each item, write a plain loop.

The usual slip is to think the part before `for` is done to the whole list at once. It's done to each item.
