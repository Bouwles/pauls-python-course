---
id: learn-closures
type: learn
title: A function that remembers
concept: closures
code: |
  def make_greeting(stall):
      def greet(name):
          return f"Welcome to the {stall} stall, {name}."
      return greet


  fruit = make_greeting("fruit")
  cake = make_greeting("cake")
  print(fruit("Neil"))
  print(cake("Riya"))
---
A function can be defined inside another function. The inner one can use the outer one's variables, and it keeps hold of them even after the outer function has finished. An inner function like that is a **closure**.

Caitlin's timer needs one: an inner function that remembers which till function it's timing.

`make_greeting("fruit")` makes a `greet` that remembers `stall` is `"fruit"`, and hands it back without calling it. Each call to `make_greeting` makes a fresh `stall`, so the two greetings stay different. The example prints `Welcome to the fruit stall, Neil.`, then the cake stall's welcome for Riya.

The usual slip is to think `stall` is gone once `make_greeting` returns. The closure kept it.
