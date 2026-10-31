---
id: investigate
type: investigate
title: Who does the work, and when
concept: lazy-evaluation
code: |
  def corrected(raw):
      for value in raw:
          print("reading", value)
          yield value - 50


  readings = corrected([210, 340, 400])
  print("ready")
  for level in readings:
      print(level)
tasks:
  - id: after-ready
    prompt: "Run it. What is printed on the line straight after `ready`?"
    kind: answer
    accept: ["reading 210"]
    feedback: "Nothing in `corrected` ran when it was called on line 7. It started when the `for` loop asked for the first value."
    wrong: "Copy the line under `ready` exactly as it appears."
  - id: how-many
    prompt: "How many `reading` lines appear before `160`?"
    kind: answer
    accept: ["1", "one"]
    feedback: "One. Each value is worked out only when the loop asks for it. Then the generator pauses until it's asked again."
  - id: sum-again
    prompt: "Add `print(sum(readings))` as the last line, outside the loop. What does it print?"
    kind: answer
    accept: ["0"]
    feedback: "0. The loop had every value out of `readings` already. A used-up generator gives nothing more, and it doesn't complain about it."
    wrong: "Look at the very last line of the output."
  - id: true-total
    prompt: "Change the program so its last line prints the real total, `800`."
    kind: run
    tests: |
      TESTS = [
          output("The last line is the total", expect="800", match="last_line",
                 hint="The loop used the generator up. Call corrected() again for the sum, or keep the values in a list."),
      ]
    solution: |
      def corrected(raw):
          for value in raw:
              print("reading", value)
              yield value - 50


      readings = list(corrected([210, 340, 400]))
      print("ready")
      for level in readings:
          print(level)
      print(sum(readings))
---
Neil's new light sensor reads 50 too high, so every reading needs 50 taking off. The `print` inside the generator shows the exact moment each value is worked out.

This is **lazy evaluation**: nothing is worked out until something asks for it.
