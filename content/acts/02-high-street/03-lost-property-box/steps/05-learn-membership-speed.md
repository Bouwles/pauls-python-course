---
id: learn-membership-speed
type: learn
title: How fast is in
concept: membership-speed
code: |
  tickets = list(range(1, 100_001))
  ticket_set = set(tickets)

  print(len(tickets))
  print(99_999 in tickets)
  print(99_999 in ticket_set)
---
`in` gives the same answer on a list and on a set. Where they differ is time.

A list checks its items one at a time, from the front. The further back the item, the longer it takes, and to say no it has to check every one. A set goes straight to the place where the item would be, so it takes about the same time however big the set is.

So when a program asks `in` again and again, make a set first.

`100_000` is the number 100000. Python ignores the underscore: it's there for your eyes. The example prints `100000`, `True`, then `True`.

The usual slip is to think `in` is always instant.
