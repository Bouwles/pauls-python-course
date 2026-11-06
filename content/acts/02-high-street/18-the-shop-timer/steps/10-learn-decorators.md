---
id: learn-decorators
type: learn
title: Wrapping a function
concept: decorators
code: |
  def announced(func):
      def wrapper(name):
          print("Next up:", name)
          return func(name)
      return wrapper


  @announced
  def weigh(name):
      return f"{name} weighed"


  print(weigh("plums"))
---
A **decorator** is a function that takes a function and hands back a replacement for it. The replacement, usually called `wrapper`, does something extra and calls the original.

That's how Caitlin's timer works: it can go on any of the till's functions without changing a line inside them.

`@announced` above a `def` is short for `weigh = announced(weigh)`. It runs once, when the `def` runs. From then on, `weigh` means `wrapper`, a closure that remembers the original as `func`. The example prints `Next up: plums`, then `plums weighed`.

The usual slip is to forget the `return` in the wrapper. Then every call gives back `None`, and the original's answer is lost.
