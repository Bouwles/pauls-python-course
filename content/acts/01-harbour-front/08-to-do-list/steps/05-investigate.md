---
id: investigate-slices
type: investigate
title: Cutting a slice
concept: slicing
code: |
  tasks = ["sort the post", "mend the scales", "order stamps", "sweep up", "answer Agnes"]
  print(tasks[0:2])
tasks:
  - id: first-slice
    prompt: "Run it. What does it print?"
    kind: answer
    accept: ["['sort the post', 'mend the scales']", "[\"sort the post\", \"mend the scales\"]", "sort the post, mend the scales", "sort the post and mend the scales"]
    feedback: "Two items, from indexes 0 and 1. A slice stops just before its second number."
    wrong: "Copy the output exactly, brackets and all."
  - id: how-many
    prompt: "Change it to `tasks[1:4]`. How many tasks does it print?"
    kind: answer
    accept: ["3", "three"]
    feedback: "Three: indexes 1, 2 and 3. Stop minus start is how many you get."
  - id: last-two
    prompt: "Try `tasks[-2:]`. Which two tasks come out?"
    kind: answer
    accept: ["sweep up, answer Agnes", "['sweep up', 'answer Agnes']", "sweep up and answer Agnes", "sweep up answer Agnes"]
    feedback: "The last two. Leave a number out and the slice runs to that end of the list."
  - id: past-the-end
    prompt: "Try `tasks[3:50]`. The list only has five items. Does it crash?"
    kind: answer
    accept: ["no", "it doesn't", "no it doesn't", "no, it doesn't", "no crash", "it doesn't crash"]
    feedback: "No. A slice gives you whatever is there, even if you ask for more. An index past the end would crash; a slice never does."
  - id: first-three
    prompt: "Mira does three jobs before the post goes out. Change the print so it shows the first three tasks."
    kind: run
    tests: |
      TESTS = [
          output("The first three", expect="['sort the post', 'mend the scales', 'order stamps']",
                 hint="Indexes 0, 1 and 2. The stop number is one past the last one you want."),
      ]
    solution: |
      tasks = ["sort the post", "mend the scales", "order stamps", "sweep up", "answer Agnes"]
      print(tasks[:3])
---
A **slice** takes part of a list: `tasks[start:stop]`. It makes a new list and leaves the old one alone.

Work through the questions on the left.
