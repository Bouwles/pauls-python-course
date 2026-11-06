---
id: predict-comments
type: predict
title: What do the notes do?
concept: comments
code: |
  # Sign for the Workshop door
  print("Class at 9")  # Paul is never late
  print("Come in")
question: What does this program print?
options:
  - text: |-
      Class at 9
      Come in
    correct: true
    feedback: "Right. Python skips each `#` and everything after it on that line, so neither note reaches the output."
  - text: |-
      # Sign for the Workshop door
      Class at 9
      Come in
    misconception: comments-run
    feedback: "Line 1 starts with `#`, so it's a comment and Python skips it. Comments never print."
  - text: |-
      Class at 9  # Paul is never late
      Come in
    misconception: comments-run
    feedback: "The `#` starts a comment even halfway along a line. And `print()` only shows what's inside its quotes, which is `Class at 9`."
---
Three lines of code, and two notes for people. Work out which parts Python runs.
