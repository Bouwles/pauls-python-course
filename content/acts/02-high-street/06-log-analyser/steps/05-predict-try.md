---
id: predict-try
type: predict
title: Catching it
concept: try-except
code: |
  def read_temperature(text):
      if text == "":
          raise ValueError("no reading")
      return float(text)

  for text in ["41.5", "", "39.0"]:
      try:
          print(read_temperature(text))
      except ValueError as error:
          print("Skipped:", error)
  print("Done")
question: What does this print?
options:
  - text: |-
      41.5
      Skipped: no reading
      39.0
      Done
    correct: true
    feedback: "The empty reading raises, the `except` catches it and prints its message, and the loop carries on with `39.0`."
  - text: |-
      41.5
      Skipped: no reading
    misconception: except-ends-program
    feedback: "Once the `except` block has dealt with the error, the program carries on as normal: the loop goes on to the next reading."
  - text: |-
      41.5
      then a ValueError: no reading
    misconception: try-cannot-catch
    feedback: "An error you raise yourself is caught like any other. `except ValueError` matches it, so it never stops the program."
---
Three temperature readings from the drone's motors. One is missing.
