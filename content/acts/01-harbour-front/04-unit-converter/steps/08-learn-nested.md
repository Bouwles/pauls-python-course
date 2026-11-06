---
id: learn-nested
type: learn
title: A decision inside a decision
concept: nested-conditions
code: |
  weather = "clear"
  wind = 25
  if weather == "clear":
      if wind < 20:
          print("Launch")
      else:
          print("Too windy")
  else:
      print("Wait for clear skies")
---
An `if` can go inside another `if`'s block, indented one level further. This is called **nesting**. The inner question is only asked when the outer test was `True`. If the outer test is `False`, Python skips the whole block, inner `if` and all.

That's how one option gets a question of its own. Neil only flies his model rocket in clear weather, and then only if the wind is under 20 km/h.

The indent decides which `else` belongs to which `if`. An `else` pairs with the `if` it lines up with. The usual mistake is pairing them by distance, with the nearest `if`, instead of by indent.
