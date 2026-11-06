---
id: learn-star-args
type: learn
title: Any number of names
concept: args-kwargs
code: |
  def team(captain, *players):
      print("Captain:", captain)
      print("Players:", players)
      print(len(players), "more")

  team("Caitlin", "Neil", "Riya")
  team("Yahya")
---
A `*` before a parameter, as in `*players`, lets a function take any number of arguments. The call fills the other parameters first, and everything left over goes into that one.

Caitlin has five players to set up this week, and maybe more next term. One function with `*names` handles them all.

What it holds is a **tuple**: Python's name for a list that can't be changed, shown in round brackets. You loop over it like a list. The example prints Caitlin, `('Neil', 'Riya')` and `2 more`, then Yahya, `()` and `0 more`.

A parameter after `*players` can only be given by name: every unnamed argument has gone into `players`.

The usual slip is to think `*players` takes one argument. It takes all that are left.
