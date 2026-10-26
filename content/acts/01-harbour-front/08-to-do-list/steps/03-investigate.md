---
id: investigate
type: investigate
title: Taking stock
concept: lists
code: |
  tasks = ["sort the post", "mend the scales", "order stamps"]
  print(len(tasks))
  tasks.append("sweep up")
  print(tasks)
tasks:
  - id: length
    prompt: "Run it. What does `len(tasks)` give?"
    kind: answer
    accept: ["3", "three"]
    feedback: "3. `len` counts the items. Their indexes are 0, 1 and 2, so the last index is always one less than the length."
  - id: where-sweep
    prompt: "`append` puts sweeping up on the end. What is its index?"
    kind: answer
    accept: ["3", "three", "index 3"]
    feedback: "3. It went in after ordering stamps, which is at index 2."
  - id: too-far
    prompt: "Add `print(tasks[4])` at the end and run it. What kind of error is it?"
    kind: answer
    accept: ["IndexError", "IndexError: list index out of range", "index error"]
    feedback: "IndexError. Four tasks have indexes 0 to 3. There is no index 4."
    wrong: "Read the last line of the traceback. The error's name is the first word."
  - id: newest
    prompt: "Swap that line for `print(tasks[-1])`. Which task prints?"
    kind: answer
    accept: ["sweep up", "sweeping up"]
    feedback: "Sweep up. A negative index counts back from the end: `-1` is always the last item, however long the list is."
  - id: pop
    prompt: "Now swap it for `print(tasks.pop())`. Which task comes off?"
    kind: answer
    accept: ["sweep up", "sweeping up"]
    feedback: "Sweep up again. `pop()` with nothing in the brackets takes the last item off and hands it back."
  - id: scales-done
    prompt: "Reset the code. Add one line so `mend the scales` is taken off with `pop` and its index, before the list is printed."
    kind: run
    tests: |
      TESTS = [
          output("The scales are mended", expect="['sort the post', 'order stamps', 'sweep up']", match="last_line",
                 hint="Mending the scales is at index 1. tasks.pop(1) takes it off. Do it before the last print."),
      ]
    solution: |
      tasks = ["sort the post", "mend the scales", "order stamps"]
      print(len(tasks))
      tasks.append("sweep up")
      tasks.pop(1)
      print(tasks)
---
`len(tasks)` is how many items the list holds. `tasks.append(x)` puts `x` on the end.

`tasks.pop()` takes the last item off and hands it back. `tasks.pop(1)` takes off the item at index 1, and the ones after it move up to fill the gap.
