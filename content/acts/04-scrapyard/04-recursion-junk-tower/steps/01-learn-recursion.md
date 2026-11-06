---
id: learn-recursion
type: learn
title: A function that calls itself
concept: recursion
dialogue:
  - neil.laughing.point: "The kart track's lot came in crates. Open one, there's a sprocket and another crate."
code: |
  def weigh(crate):
      total = 0
      for thing in crate:
          if isinstance(thing, list):
              total = total + weigh(thing)
          else:
              total = total + thing
      return total


  print(weigh([3, [2, 4]]))
---
A function may call itself. That's **recursion**, and it suits anything packed the way Neil's crates are: open a crate, and inside are parts and smaller crates.

To weigh a crate, add up its parts, and weigh each crate inside it the same way, by calling the same function on that smaller crate. Each call handles one crate and trusts the calls it makes to handle the rest.

Here a crate is a list and a part is its weight in kilograms. `isinstance(thing, list)` asks whether `thing` is a list. The example weighs `[3, [2, 4]]`: 3, plus whatever `weigh([2, 4])` gives back, which is 6. It prints `9`.

The usual slip is to think a function can't use its own name yet. The `def` has finished long before the call happens.
