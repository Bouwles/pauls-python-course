---
id: learn-functions-as-values
type: learn
title: A function is a value
concept: functions-as-values
code: |
  def shout(text):
      return text.upper()


  def twice(func, text):
      return func(text) + " " + func(text)


  call_out = shout
  print(call_out("plums"))
  print(twice(shout, "figs"))
---
A function is a value, like a number or a list. Its name without brackets is the function itself. With brackets, `shout("plums")`, it's called.

So a function can be given another name, kept in a list, or handed to another function as an argument. The function that receives it calls it when it's ready. Caitlin's timer will be handed each of the till's functions in turn.

`call_out = shout` gives the same function a second name. `twice(shout, "figs")` hands `shout` over, and `twice` calls it with `func(text)`. The example prints `PLUMS`, then `FIGS FIGS`.

The usual slip is to add brackets when passing it on: `twice(shout(), "figs")`. That calls `shout` there and then, with no text, and it fails.
