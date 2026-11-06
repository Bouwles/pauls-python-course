---
id: investigate
type: investigate
title: Until the round is done
concept: sentinels
code: |
  order = input("Order? ")
  while order != "done":
      print("Making a", order)
      order = input("Order? ")
  print("Tea round finished.")
inputs: ["tea", "coffee", "done"]
tasks:
  - id: two-pints
    prompt: "Run it. Type `tea`, then `coffee`, then `done`. How many drinks are made?"
    kind: answer
    accept: ["2", "two", "twice"]
    feedback: "Two, one per order. `done` isn't an order: it's the signal to stop, and the loop never runs for it."
  - id: time-first
    prompt: "Run it again and type `done` straight away. How many drinks now?"
    kind: answer
    accept: ["0", "none", "zero", "no drinks", "never", "not any", "nil"]
    feedback: "None. A `while` asks its test before the first pass. If it's `False` from the start, the indented lines never run."
  - id: which-line
    prompt: "Once the loop is running, which line asks for each new order? Give its number."
    kind: answer
    accept: ["4", "line 4", "four"]
    feedback: "Line 4. Line 1 only asks for the first order, so the `while` has something to test."
    wrong: "Line 1 runs once, before the loop. Look for the `input()` that's indented."
  - id: count-pints
    prompt: "Add a counter called `drinks`. Set it to 0 above the loop, add 1 to it inside the loop, and after the loop print it with `print(f\"Drinks: {drinks}\")`."
    kind: run
    tests: |
      TESTS = [
          output("Two orders", inputs=["tea", "coffee", "done"], expect="Drinks: 2", match="last_line",
                 hint="Add one to drinks inside the loop, then print it after the loop, not indented."),
          output("Done straight away", inputs=["done"], expect="Drinks: 0", match="last_line",
                 hint="Set drinks to 0 before the loop, so it exists even when the loop never runs."),
          output("Four orders", inputs=["tea", "coffee", "tea", "hot chocolate", "done"], expect="Drinks: 4", match="last_line"),
      ]
    solution: |
      drinks = 0
      order = input("Order? ")
      while order != "done":
          print("Making a", order)
          drinks = drinks + 1
          order = input("Order? ")
      print("Tea round finished.")
      print(f"Drinks: {drinks}")
---
Caitlin does the Studio's tea round. Her stop word is `done`: the loop makes drinks until she types it.
