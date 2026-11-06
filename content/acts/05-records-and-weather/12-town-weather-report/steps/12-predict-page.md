---
id: predict-page
type: predict
title: There and back
concept: modules
code: |
  import base64

  letters = base64.b64encode(b"Hi").decode("ascii")
  print(type(letters).__name__, base64.b64decode(letters))
question: What does this print?
options:
  - text: "str b'Hi'"
    correct: true
    feedback: "Right. `.decode(\"ascii\")` turns the letters into a string, ready for a page. `b64decode` turns them back into the bytes they came from."
  - text: "bytes b'Hi'"
    misconception: decode-leaves-bytes
    feedback: "`b64encode` gives bytes, but `.decode(\"ascii\")` turns them into a string. That's what lets them go into an f-string."
  - text: "str Hi"
    misconception: b64decode-gives-text
    feedback: "`b64decode` gives back bytes, the same kind of thing that went in, so it prints with a `b` in front."
---
Two bytes, written as letters and read back.
