---
id: learn-exceptions
type: learn
title: When something goes wrong
concept: exceptions
code: |
  def per_person(slices, people):
      return slices // people

  print("Cutting the cake.")
  print(per_person(12, 0))
  print("Everyone has cake.")
error: ZeroDivisionError
---
When something goes wrong as a program runs, Python **raises an exception**: an error with a type and a message. You've met `ValueError` and `NameError`. Dividing by zero raises a `ZeroDivisionError`.

Yahya's calculator will be asked to divide by zero, so you need to know where that error goes.

An exception inside a function doesn't stay there. It travels back up to the line that called the function, and if nothing catches it, the whole program stops. The example prints `Cutting the cake.`, then a traceback, and never reaches its last line. The traceback lists line 2, where it went wrong, and line 5, where `per_person` was called.

The usual slip is to expect Python to skip the bad line and carry on. It doesn't.
