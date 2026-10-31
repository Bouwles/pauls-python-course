---
id: predict-pass
type: predict
title: A function is a value
concept: functions-as-values
code: |
  def shout(text):
      return text.upper()


  def whisper(text):
      return text.lower()


  def announce(style, message):
      return style(message)


  print(announce(shout, "Fresh figs"))
  print(announce(whisper, "Fresh figs"))
question: What does this print?
options:
  - text: |-
      FRESH FIGS
      fresh figs
    correct: true
    feedback: "Right. `shout` without brackets is the function itself, handed over like any other value. Inside, `style(message)` calls whichever one arrived."
  - text: "A TypeError: shout() is missing its text"
    misconception: passing-function-calls-it
    error: TypeError
    feedback: "No brackets, no call. `announce(shout, ...)` hands over the function itself. It's called on the line `style(message)`, and by then it has its text."
  - text: "A NameError: style is not defined"
    misconception: functions-not-values
    error: NameError
    feedback: "`style` is a parameter, like `message`. It holds whatever was passed in, and a function can be passed in like a number or a string."
---
The fruit stall's till calls out the specials. Look closely at which names on the last two lines have brackets after them, and which don't.
