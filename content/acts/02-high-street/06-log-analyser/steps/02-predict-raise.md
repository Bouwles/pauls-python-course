---
id: predict-raise
type: predict
title: The wrong shape
concept: raising-errors
code: |
  def parts_of(line):
      parts = line.split("|")
      if len(parts) != 4:
          raise ValueError(f"expected 4 parts, got {len(parts)}")
      return parts

  print(len(parts_of("01:05 | ERROR | camera | card full")))
  print(len(parts_of("01:15 | ERROR | radio")))
  print("Report done")
question: What happens when this runs?
verify: error
options:
  - text: |-
      4
      then a ValueError: expected 4 parts, got 3
    correct: true
    error: ValueError
    feedback: "The second line has three parts, so `raise` stops the program with that message. Nothing after it runs, `Report done` included."
  - text: |-
      4
      expected 4 parts, got 3
      3
      Report done
    misconception: raise-prints-message
    feedback: "`raise` doesn't print and carry on. It stops the function there, and with nothing to catch the error, the whole program stops."
  - text: |-
      4
      then a ValueError, then Report done
    misconception: exception-stays-in-function
    feedback: "The error doesn't stay inside `parts_of`. It travels back to line 8, which called it, and stops the program there."
---
Two lines from Neil's flight log. The radio's line is one part short.
