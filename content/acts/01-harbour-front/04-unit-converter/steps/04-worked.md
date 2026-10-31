---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "This is how I price the Workshop's post. A menu, and one option that needs a second question."
code: |
  # Postage for the Workshop's letters and parcels
  print("1. Letter")
  print("2. Parcel")
  choice = input("Choose 1 or 2: ")

  if choice == "1":
      print("That's 0.85.")
  elif choice == "2":
      kg = float(input("Weight in kg? "))
      if kg <= 2:
          cost = 3.35
      else:
          cost = 3.35 + (kg - 2) * 1.20
      print(f"That's {cost:.2f}.")
  else:
      print("No such option.")
inputs: ["2", "4"]
subgoals:
  - label: Show the menu and ask
    lines: [2, 4]
  - label: Choose what to do, one option at a time
    lines: [6, 8]
  - label: Decide again inside the option that has a special case
    lines: [9, 14]
  - label: Catch everything else
    lines: [15, 16]
explain:
  prompt: "Why is the weight question inside the `elif`, and not up at the top with the menu?"
  answer: "Only parcels get weighed. Asked at the top, it would weigh every letter too. Inside the `elif`, it's only asked once Python knows it's a parcel."
  concept: nested-conditions
---
An `if` inside another `if` is **nested**. The inner test is only asked when the outer one has let Python in, and the extra indent shows which is which.

The `else` at the bottom catches anything that isn't on the menu: a `3`, a typo, an empty answer. The labels in the margin are Paul's steps; your starter file has them.
