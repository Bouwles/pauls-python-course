---
id: investigate
type: investigate
title: Until it clears
concept: sentinels
code: |
  reading = input("Visibility in metres? ")
  while reading != "clear":
      print("Horn sounds.")
      reading = input("Visibility in metres? ")
  print("Fog has cleared.")
inputs: ["300", "200", "clear"]
tasks:
  - id: two-readings
    prompt: "Run it. Type `300`, then `200`, then `clear`. How many times does the horn sound?"
    kind: answer
    accept: ["2", "two", "twice"]
    feedback: "Twice, once for each reading. `clear` isn't a reading: it's the signal to stop, and the loop never runs for it."
  - id: clear-first
    prompt: "Run it again and type `clear` straight away. How many times does the horn sound now?"
    kind: answer
    accept: ["0", "none", "zero", "no times", "never", "not at all", "nil"]
    feedback: "None. The test is asked before the first pass. If it's `False` from the start, the body never runs."
  - id: which-line
    prompt: "The loop gets each new reading from one of the two `input()` lines. Which line number?"
    kind: answer
    accept: ["4", "line 4", "four"]
    feedback: "Line 4. Line 1 only fetches the first reading, so the `while` has something to test."
  - id: count-horns
    prompt: "Count the horns. Set `horns = 0` before the loop, add one to it inside, and print `Horns: 2` (or however many there were) as the very last line."
    kind: run
    tests: |
      TESTS = [
          output("Two readings", inputs=["300", "200", "clear"], expect="Horns: 2", match="last_line",
                 hint="Add one to horns inside the loop, then print it after the loop, not indented."),
          output("Clear straight away", inputs=["clear"], expect="Horns: 0", match="last_line",
                 hint="Set horns to 0 before the loop, so it exists even when the loop never runs."),
          output("Four readings", inputs=["50", "80", "120", "400", "clear"], expect="Horns: 4", match="last_line"),
      ]
    solution: |
      horns = 0
      reading = input("Visibility in metres? ")
      while reading != "clear":
          print("Horn sounds.")
          horns = horns + 1
          reading = input("Visibility in metres? ")
      print("Fog has cleared.")
      print(f"Horns: {horns}")
---
A **sentinel** is a value that means "stop", not "here's another one". Here the sentinel is the word `clear`.

`!=` means "is not equal to", so this loop runs while the reading is anything but `clear`.
