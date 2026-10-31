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
    feedback: "None. A `while` asks its test before the first pass. If it's `False` from the start, the body never runs."
  - id: which-line
    prompt: "Once the loop is running, which line fetches each new order?"
    kind: answer
    accept: ["4", "line 4", "four"]
    feedback: "Line 4. Line 1 only fetches the first order, so the `while` has something to test."
  - id: count-pints
    prompt: "Count the drinks. Set `drinks = 0` before the loop, add one to it inside, and print `Drinks: 2` (or however many there were) as the very last line."
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
A **sentinel** is a value that means stop, not here's another one. Neil does the Studio's tea round, and his sentinel is the word `done`.

`!=` means is not equal to, so this loop runs while the order is anything but `done`.

A **counter** starts at 0 before the loop and goes up by 1 on every pass.
