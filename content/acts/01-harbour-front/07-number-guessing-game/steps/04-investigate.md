---
id: investigate-random
type: investigate
title: Pick a number
concept: random-module
code: |
  import random

  secret = random.randint(1, 100)
  print("Caitlin's number:", secret)
  print("Still:", secret)
tasks:
  - id: same-twice
    prompt: "Run it. Are the two numbers in one run the same?"
    kind: answer
    accept: ["yes", "same", "the same", "they are the same", "yes they are", "yes, the same"]
    feedback: "Yes. `randint` picks once, on line 3, and `secret` keeps that number. Reading the variable doesn't pick again."
  - id: run-again
    prompt: "Run it a few more times. Is it the same number every run?"
    kind: answer
    accept: ["no", "not always", "different", "they change", "no, it changes", "no they change", "usually not"]
    feedback: "No. Each run picks again. Within a run, `secret` stays put."
  - id: biggest
    prompt: "Change it to `random.randint(1, 3)` and run it several times. What is the biggest number you see?"
    kind: answer
    accept: ["3", "three"]
    feedback: "3. Unlike `range`, `randint` includes both ends: 1, 2 or 3."
    wrong: "Keep running it. Every number it can give will turn up sooner or later."
  - id: dice
    prompt: "Caitlin needs a die for a board game. Make it pick a number from 1 to 6 and print only `You rolled 4.` (or whatever comes up)."
    kind: run
    tests: |
      def rolled(number):
          def check(ctx):
              import random
              old = random.randint
              calls = []
              def fake(low, high):
                  calls.append((low, high))
                  return number
              random.randint = fake
              try:
                  r = ctx.run_program()
              finally:
                  random.randint = old
              if calls != [(1, 6)]:
                  made = ", ".join(f"randint{c}" for c in calls) or "no call to randint"
                  raise CheckFailed("Pick once, with random.randint(1, 6).", expected="randint(1, 6)", actual=made)
              if norm_lines(r.output) != [f"You rolled {number}."]:
                  raise CheckFailed(f"When the die shows {number}, print exactly: You rolled {number}.",
                                    expected=f"You rolled {number}.", actual=r.output)
          return check

      TESTS = [custom("A roll of 4", rolled(4)), custom("A roll of 6", rolled(6))]
    solution: |
      import random

      roll = random.randint(1, 6)
      print(f"You rolled {roll}.")
---
`import random` loads the `random` module. After that, `random.randint(low, high)` picks a whole number from `low` to `high`.

The dot means the `randint` that lives in `random`.
