---
id: predict
type: predict
title: What's inside the loop
concept: for-loops
code: |
  for question in range(3):
      print("Question")
  print("Quiz done")
question: What does this print?
options:
  - text: |-
      Question
      Question
      Question
      Quiz done
    correct: true
    feedback: "Right. The indented line is the body, and it runs once per pass. The last line isn't indented, so it runs once, after the loop is done."
  - text: |-
      Question
      Quiz done
      Question
      Quiz done
      Question
      Quiz done
    misconception: unindented-line-in-loop
    feedback: "Only the indented lines repeat. `print(\"Quiz done\")` starts at the left edge, so it waits until the loop has finished."
  - text: |-
      Question
      Question
      Question
      Question
      Quiz done
    misconception: range-includes-end
    feedback: "`range(3)` gives 0, 1 and 2. Three numbers, three questions. It stops before 3."
  - text: |-
      Question
      Quiz done
    misconception: loop-body-runs-once
    feedback: "A `for` loop runs its body once for every number in the range. Three numbers, three passes."
after: |
  Run it.
---
A `for` loop repeats the indented lines under it. The colon at the end of the first line is where the repeating part starts.
