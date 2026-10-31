---
id: investigate
type: investigate
title: In and out
concept: parameters
code: |
  def round_cost(coffees, price):
      return coffees * price

  total = round_cost(4, 3.5)
  print(total)
tasks:
  - id: run-it
    prompt: "Run it. What does it print?"
    kind: answer
    accept: ["14.0", "14"]
    feedback: "14.0. Inside the function `coffees` was 4 and `price` was 3.5. `return` handed back the answer, and line 4 caught it in `total`."
  - id: order
    prompt: "If line 4 said `round_cost(3.5, 4)`, what would `coffees` be inside the function?"
    kind: answer
    accept: ["3.5"]
    feedback: "3.5. Values fill the parameters in order, first to first. The names don't come into it."
  - id: outside
    prompt: "Add `print(coffees)` as the last line and run it. What kind of error is it?"
    kind: answer
    accept: ["NameError", "name error", "NameError: name 'coffees' is not defined"]
    feedback: "A NameError. `coffees` only exists inside the function, while it runs. Where a name exists is called its **scope**."
    wrong: "Read the last line of the traceback. The first word is the kind of error."
  - id: tip
    prompt: "Take out `print(coffees)`. Give `round_cost` a third parameter, `tip`, added to the total, and change the call to `round_cost(4, 3.5, 2)`."
    kind: run
    tests: |
      TESTS = [
          output("Four coffees and a tip of 2", expect="16.0",
                 hint="Add tip to the brackets of the def, add it in the return line, and pass 2 in the call."),
          function("Two coffees at 4.0, tip 1", call="round_cost", args=(2, 4.0, 1), expect=9.0),
      ]
    solution: |
      def round_cost(coffees, price, tip):
          return coffees * price + tip

      total = round_cost(4, 3.5, 2)
      print(total)
---
The names in the brackets of a `def` are **parameters**. Each call fills them with values.

`return` hands a value back to whoever called the function.
