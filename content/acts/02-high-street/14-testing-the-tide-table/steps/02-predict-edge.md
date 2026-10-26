---
id: predict-edge
type: predict
title: Exactly everything
concept: edge-cases
code: |
  def can_withdraw(balance, pence):
      return pence < balance


  print(can_withdraw(800, 500))
  print(can_withdraw(800, 800))
question: What does this print?
options:
  - text: |-
      True
      False
    correct: true
    feedback: "Right. `<` is true only for amounts below the balance, so Gwen can't take out the last of her own money. It works for every amount you'd think to try, and goes wrong exactly at the edge."
  - text: |-
      True
      True
    misconception: code-knows-what-you-meant
    feedback: "Python does exactly the comparison written down. 800 < 800 is False, whatever the programmer meant."
  - text: True, then a ValueError
    misconception: wrong-answers-crash
    error: ValueError
    feedback: "False is a perfectly good answer to Python. Wrong answers don't crash, which is what makes edge cases dangerous."
---
An **edge case** is an input at the boundary of what a function handles: zero, empty, exactly on a limit. Most bugs live there, because it's where nobody looked.

Gwen has £8 in her account, and wants all of it for the brewery.
