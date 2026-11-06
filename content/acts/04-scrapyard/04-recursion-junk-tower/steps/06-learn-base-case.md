---
id: learn-base-case
type: learn
title: Where it stops
concept: base-cases
code: |
  def countdown(seconds):
      if seconds == 0:
          print("lift-off")
          return
      print(seconds)
      countdown(seconds - 1)


  countdown(3)
---
Every recursive function needs a **base case**: a case it answers straight away, without calling itself. Every other call must bring the problem a step closer to it, or the calls never end.

In `weigh`, a crate with no crates inside is the base case: its loop adds up the parts and calls nothing.

Neil's countdown has `seconds == 0` as its base case, and every other call asks about one second less. It prints `3`, `2`, `1`, `lift-off`.

If the base case is never reached, the calls pile up until Python stops the program with a `RecursionError`, at about a thousand waiting calls. The usual slip is a base case the steps can jump over. Counting down in twos from 3 goes 3, 1, -1, and never meets 0.
