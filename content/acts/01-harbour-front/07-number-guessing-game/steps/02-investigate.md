---
id: investigate
type: investigate
title: Until time is called
concept: sentinels
code: |
  order = input("Order? ")
  while order != "time":
      print("Pulling a pint of", order)
      order = input("Order? ")
  print("Time, please.")
inputs: ["bitter", "cider", "time"]
tasks:
  - id: two-pints
    prompt: "Run it. Type `bitter`, then `cider`, then `time`. How many pints are pulled?"
    kind: answer
    accept: ["2", "two", "twice"]
    feedback: "Two, one per order. `time` isn't an order: it's the signal to stop, and the loop never runs for it."
  - id: time-first
    prompt: "Run it again and type `time` straight away. How many pints now?"
    kind: answer
    accept: ["0", "none", "zero", "no pints", "never", "not any", "nil"]
    feedback: "None. A `while` asks its test before the first pass. If it's `False` from the start, the body never runs."
  - id: which-line
    prompt: "Once the loop is running, which line fetches each new order?"
    kind: answer
    accept: ["4", "line 4", "four"]
    feedback: "Line 4. Line 1 only fetches the first order, so the `while` has something to test."
  - id: count-pints
    prompt: "Count the pints. Set `pints = 0` before the loop, add one to it inside, and print `Pints: 2` (or however many there were) as the very last line."
    kind: run
    tests: |
      TESTS = [
          output("Two orders", inputs=["bitter", "cider", "time"], expect="Pints: 2", match="last_line",
                 hint="Add one to pints inside the loop, then print it after the loop, not indented."),
          output("Time straight away", inputs=["time"], expect="Pints: 0", match="last_line",
                 hint="Set pints to 0 before the loop, so it exists even when the loop never runs."),
          output("Four orders", inputs=["stout", "cider", "bitter", "lemonade", "time"], expect="Pints: 4", match="last_line"),
      ]
    solution: |
      pints = 0
      order = input("Order? ")
      while order != "time":
          print("Pulling a pint of", order)
          pints = pints + 1
          order = input("Order? ")
      print("Time, please.")
      print(f"Pints: {pints}")
---
A **sentinel** is a value that means stop, not here's another one. Gwen's is the word `time`.

`!=` means is not equal to, so this loop runs while the order is anything but `time`.

A **counter** starts at 0 before the loop and goes up by 1 on every pass.
