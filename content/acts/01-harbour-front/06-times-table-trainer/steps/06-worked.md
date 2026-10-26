---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Gwen's new barman has to know his measures in millilitres. Same shape of job."
code: |
  # Gwen's new barman: glasses into millilitres, then three questions
  size = int(input("Glass size in ml? "))

  for glasses in range(1, 7):
      print(f"{glasses} x {size} ml = {glasses * size:4} ml")

  print("Questions.")
  score = 0
  for glasses in range(2, 5):
      answer = int(input(f"{glasses} glasses in ml? "))
      if answer == glasses * size:
          print("Right.")
          score = score + 1
      else:
          print(f"No, {glasses * size}.")

  print(f"Score: {score} out of 3")
inputs: ["568", "1136", "1700", "2272"]
subgoals:
  - label: Ask which one
    lines: [2, 2]
  - label: Print every row, lined up
    lines: [4, 5]
  - label: Start the score at zero
    lines: [7, 8]
  - label: Ask each question in a loop
    lines: [9, 10]
  - label: Mark it and keep score
    lines: [11, 15]
  - label: Report the score once, after the loop
    lines: [17, 17]
explain:
  prompt: "The score line, line 17, starts at the left edge. What would happen if it were indented under the `for` on line 9?"
  answer: "It would print after every question, three scores instead of one. At the left edge it isn't part of the loop, so it runs once, after the last question."
  concept: for-loops
---
Two loops, one after the other. The first prints the chart. The second asks three questions, one per pass.

`{glasses * size:4}` gives the answer 4 characters, because six pints is 3408 ml and the short numbers should line up under it.

`score` starts at 0 before the questions and goes up by 1 for each right answer.
