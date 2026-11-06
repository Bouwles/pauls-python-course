---
id: learn-backtracking
type: learn
title: Back out of dead ends
concept: backtracking
dialogue:
  - caitlin.neutral.point: "My bike lock. Three different digits, one to four, no two neighbours one apart. I forgot which."
code: |
  def pick(code):
      if len(code) == 3:
          return True
      for digit in range(1, 5):
          if digit in code:
              continue
          if code and abs(digit - code[-1]) == 1:
              continue
          code.append(digit)
          print("Try", code)
          if pick(code):
              return True
          code.pop()
          print("Back", code)
      return False


  code = []
  pick(code)
  print(code)
---
**Backtracking** solves a puzzle one choice at a time. Make a choice, check it at once, and carry on with the next. When nothing fits, undo the last choice and try the next option there. Picture a maze and a piece of chalk: at a dead end, walk back to the last fork and take the next turning.

It's a recursive function. Each call makes one choice and calls itself for the rest. `True` passed back means solved; `False` means a dead end, so the caller undoes its choice with `pop()` and tries the next.

`[1, 3]` is a dead end: nothing can follow the 3. So the example backs out to `[1]`, tries `[1, 4]`, and finds `[1, 4, 2]`.

The usual slip is to forget the undo. Then everything after is built on a mistake.
