---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.pleased: "I made a chart for my training runs: batches into images. Same shape of job."
code: |
  # Training runs: how many images a model sees, then three questions
  size = int(input("Batch size? "))

  for batches in range(1, 7):
      print(f"{batches} x {size} = {batches * size:4} images")

  print("Questions.")
  score = 0
  for batches in range(2, 5):
      answer = int(input(f"{batches} batches in images? "))
      if answer == batches * size:
          print("Right.")
          score = score + 1
      else:
          print(f"No, {batches * size}.")

  print(f"Score: {score} out of 3")
inputs: ["256", "512", "700", "1024"]
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
A program like the trainer: Paul's chart for his training runs. His models learn from images a batch at a time. Two loops, one after the other: the first prints the chart, and the second asks three questions, one per pass.

`{batches * size:4}` gives the answer 4 characters, because six batches of 256 is 1536 images, and the short numbers should line up under it. `score` starts at 0 before the questions and goes up by 1 for each right answer.

The six labels beside the code are Paul's steps. Your file for the Build starts with the same six, as comments.
