---
id: learn-generators
type: learn
title: A function that pauses
concept: generators
code: |
  def countdown(start):
      print("starting")
      while start > 0:
          yield start
          start = start - 1
      print("lift-off")


  rocket = countdown(3)
  print("ready")
  for number in rocket:
      print(number)
---
A function with `yield` in it is a **generator**. `yield` hands a value over, as `return` does, but the function doesn't end. It pauses there, and carries on from the same spot the next time it's asked.

Neil's log reader can hand over one line, then wait until the next is wanted.

Calling a generator function runs none of its body. It hands back a paused generator, a kind of iterator. Each `next()`, or each pass of a `for` loop, runs it as far as the next `yield`. The example prints `ready` first, then `starting`, `3`, `2`, `1` and `lift-off`.

The usual slip is to think calling it runs the body. Nothing runs until something asks for a value.
