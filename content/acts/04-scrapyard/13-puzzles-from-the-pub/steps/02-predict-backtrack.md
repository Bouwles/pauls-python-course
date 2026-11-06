---
id: predict-backtrack
type: predict
title: No way through
concept: backtracking
code: |
  def pick(code):
      if len(code) == 3:
          return True
      for digit in range(1, 4):
          if digit in code:
              continue
          if code and abs(digit - code[-1]) == 1:
              continue
          code.append(digit)
          if pick(code):
              return True
          code.pop()
      return False


  code = []
  print(pick(code), code)
question: What does this print?
options:
  - text: "False []"
    correct: true
    feedback: "Right. With only 1, 2 and 3, the 2 can never sit beside anything, so every way is a dead end. Each choice was undone on the way back, so `code` is empty again."
  - text: "False [1, 3]"
    misconception: backtrack-keeps-partial
    feedback: "Every `append` is matched by a `pop` when its way fails. By the time the first call gives up, every digit it tried has been taken off again."
  - text: "True [1, 3]"
    misconception: backtrack-gives-best-try
    feedback: "`pick` only says `True` when the code is three digits long. It never hands back the furthest it got: it tries everything, and here nothing works."
---
The same search, with digits from 1 to 3 this time.
