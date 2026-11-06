---
id: predict-name
type: predict
title: What's my name
concept: main-guard
code: |
  def sign_line(day, opens, closes):
      return f"{day} {opens} till {closes}"


  if __name__ == "__main__":
      print(sign_line("Sat", 8, 13))
  print(__name__)
question: "Run directly, as the program itself, what does this print?"
options:
  - text: |-
      Sat 8 till 13
      __main__
    correct: true
    feedback: "Run directly, `__name__` is `\"__main__\"`, so the quick check runs, and then line 7 prints the name itself."
  - text: |-
      Sat 8 till 13
      main.py
    misconception: name-is-filename
    feedback: "The file name only matters when the file is imported. Run directly, `__name__` is `__main__`, underscores and all."
  - text: __main__
    misconception: guard-never-runs
    feedback: "The guarded lines are skipped only when the file is imported. Run directly, `__name__ == \"__main__\"` is `True`, so they run."
  - text: A NameError
    misconception: name-needs-defining
    feedback: "Python sets `__name__` in every file before the first line runs. Nobody has to define it."
---
A quick check under the main guard, then one more line outside it.
