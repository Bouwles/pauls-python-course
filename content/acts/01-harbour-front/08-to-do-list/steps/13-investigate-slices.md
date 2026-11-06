---
id: investigate-slices
type: investigate
title: Cutting a slice
concept: slicing
code: |
  tasks = ["rocket poster", "album cover", "order ink", "frame the prints", "answer Caitlin"]
  print(tasks[0:2])
tasks:
  - id: first-slice
    prompt: "Run it. What does it print?"
    kind: answer
    accept: ["['rocket poster', 'album cover']", "[\"rocket poster\", \"album cover\"]", "rocket poster, album cover", "rocket poster and album cover"]
    feedback: "Two items, from indexes 0 and 1. A slice stops just before its second number."
    wrong: "Copy the output exactly, brackets and all."
  - id: how-many
    prompt: "Change line 2 to `print(tasks[1:4])`. How many tasks does it print?"
    kind: answer
    accept: ["3", "three"]
    feedback: "Three: indexes 1, 2 and 3. Stop minus start is how many you get."
  - id: last-two
    prompt: "Change the slice to `tasks[-2:]`. Which two tasks come out?"
    kind: answer
    accept: ["frame the prints, answer Caitlin", "['frame the prints', 'answer Caitlin']", "frame the prints and answer Caitlin", "frame the prints answer Caitlin"]
    feedback: "The last two. Leave a number out and the slice runs to that end of the list."
  - id: past-the-end
    prompt: "Change the slice to `tasks[3:50]`. The list only has five items. Does it crash? Answer yes or no."
    kind: answer
    accept: ["no", "it doesn't", "no it doesn't", "no, it doesn't", "no crash", "it doesn't crash"]
    feedback: "No. A slice gives you whatever is there, even if you ask for more. An index past the end would crash; a slice never does."
  - id: first-three
    prompt: "Riya does three jobs before the first class. Change the slice so line 2 prints the first three tasks."
    kind: run
    tests: |
      TESTS = [
          output("The first three", expect="['rocket poster', 'album cover', 'order ink']",
                 hint="Indexes 0, 1 and 2. The stop number is one past the last one you want."),
      ]
    solution: |
      tasks = ["rocket poster", "album cover", "order ink", "frame the prints", "answer Caitlin"]
      print(tasks[:3])
---
Riya's five jobs for the week. Each task changes the slice on line 2.
