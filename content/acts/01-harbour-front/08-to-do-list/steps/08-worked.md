---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral: "My office-hours queue for code questions. First come, first answered. Same machinery as Riya's list."
code: |
  # Office hours: questions in the order they came in
  questions = []

  while True:
      command = input("Command? ")
      if command == "shut":
          break
      elif command == "in":
          questions.append(input("Question? "))
      elif command == "next":
          if len(questions) == 0:
              print("Queue's empty. Put the kettle on.")
          else:
              print("Answering:", questions.pop(0))
      elif command == "show":
          for spot in range(len(questions)):
              print(f"{spot + 1}. {questions[spot]}")
      else:
          print("in, next, show or shut.")

  print(f"Still waiting: {len(questions)}")
inputs: ["in", "Riya: why 7.199999", "in", "Yahya: is range slow", "show", "next", "shut"]
subgoals:
  - label: Start with an empty list
    lines: [2, 2]
  - label: Keep asking for a command
    lines: [4, 5]
  - label: Stop on the quit word
    lines: [6, 7]
  - label: Add to the end
    lines: [8, 9]
  - label: Take one out, if there is one
    lines: [10, 14]
  - label: Show each item with its number from 1
    lines: [15, 17]
  - label: Catch anything else
    lines: [18, 19]
  - label: Report after the loop
    lines: [21, 21]
explain:
  prompt: "Line 17 prints `spot + 1`, but line 14 uses `pop(0)`. Why add one in one place and not the other?"
  answer: "Python's indexes start at 0 and people's numbers start at 1. `spot + 1` turns an index into the number a person reads. `pop(0)` is talking to Python, so it uses the index."
  concept: indexing
---
`[]` is an empty list, ready to fill. `questions.pop(0)` takes off the first item and hands it back, so the oldest question is always next.

`range(len(questions))` gives every index the list has, so the loop fits however many questions are waiting. With none, it runs zero times.
