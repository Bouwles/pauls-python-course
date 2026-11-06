---
id: predict-params
type: predict
title: First to first
concept: parameters
code: |
  def label(name, room):
      print(f"{name}: {room}")

  room = "The Archive"
  name = "Yahya"
  label(room, name)
question: What does this print?
options:
  - text: "The Archive: Yahya"
    correct: true
    feedback: "The first value in the call fills the first parameter. `room` holds `The Archive`, so that goes into `name`. The names outside don't matter."
  - text: "Yahya: The Archive"
    misconception: arguments-fill-by-name
    feedback: "Values fill the parameters by position, not by name. The call passes `room` first, so `The Archive` goes into `name`."
  - text: An error
    misconception: parameter-name-must-match
    error: TypeError
    feedback: "The names in the call don't have to match the parameters. Two values for two parameters is all Python needs."
---
Riya is labelling the pigeonholes. Read the last line carefully.
