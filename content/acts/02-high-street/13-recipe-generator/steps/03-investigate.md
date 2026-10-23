---
id: investigate
type: investigate
title: Who does the work, and when
concept: lazy-evaluation
code: |
  def scale(amounts, batches):
      for grams in amounts:
          print("working out", grams)
          yield grams * batches


  scaled = scale([500, 10, 350], 3)
  print("ready")
  for grams in scaled:
      print(grams)
tasks:
  - id: after-ready
    prompt: "Run it. What is printed on the line straight after `ready`?"
    kind: answer
    accept: ["working out 500"]
    feedback: "Nothing in `scale` ran when it was called on line 7. It started when the `for` loop asked for the first value."
    wrong: "Copy the line under `ready` exactly as it appears."
  - id: how-many
    prompt: "How many `working out` lines appear before `1500`?"
    kind: answer
    accept: ["1", "one"]
    feedback: "One. Each value is worked out only when the loop asks for it. Then the generator pauses until it's asked again."
  - id: sum-again
    prompt: "Add `print(sum(scaled))` as the last line, outside the loop. What does it print?"
    kind: answer
    accept: ["0"]
    feedback: "0. The loop had every value out of `scaled` already. A used-up generator gives nothing more, and it doesn't complain about it."
    wrong: "Look at the very last line of the output."
  - id: true-total
    prompt: "Change the program so its last line prints the real total, `2580`."
    kind: run
    tests: |
      TESTS = [
          output("The last line is the total", expect="2580", match="last_line",
                 hint="The loop used the generator up. Call scale() again for the sum, or keep the values in a list."),
      ]
    solution: |
      def scale(amounts, batches):
          for grams in amounts:
              print("working out", grams)
              yield grams * batches


      scaled = list(scale([500, 10, 350], 3))
      print("ready")
      for grams in scaled:
          print(grams)
      print(sum(scaled))
---
Bea's scaler, cut down to three amounts. The `print` inside `scale` shows the exact moment each value is worked out.

This is **lazy evaluation**: nothing is worked out until something asks for it.
