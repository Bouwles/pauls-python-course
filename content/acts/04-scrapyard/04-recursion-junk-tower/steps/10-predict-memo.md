---
id: predict-memo
type: predict
title: The board is already written on
concept: memoisation
code: |
  calls = []


  def ways(rungs, known):
      calls.append(rungs)
      if rungs in known:
          return known[rungs]
      if rungs <= 1:
          answer = 1
      else:
          answer = ways(rungs - 1, known) + ways(rungs - 2, known)
      known[rungs] = answer
      return answer


  known = {}
  print(ways(6, known), len(calls))
  calls.clear()
  print(ways(7, known), len(calls))
question: What does this print?
options:
  - text: |-
      13 11
      21 3
    correct: true
    feedback: "Right. The second call works out only the 7. It asks about 6 and 5, and both are on the board from the first call: three calls in all."
  - text: |-
      13 11
      21 13
    misconception: memo-forgets-between-calls
    feedback: "`known` is the same dictionary both times, and the first call filled it in. So `ways(7, known)` finds 6 and 5 already written down."
  - text: |-
      13 11
      21 1
    misconception: memo-knows-unasked
    feedback: "Nothing has worked out 7 yet, so it isn't on the board. That call has to work it out, from 6 and 5, which are."
---
The same `ways`, called twice with the same `known`. `calls.clear()` empties the list of calls in between.
