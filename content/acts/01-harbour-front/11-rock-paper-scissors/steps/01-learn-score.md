---
id: learn-score
type: learn
title: A dictionary for the score
concept: dictionaries
code: |
  wins = {"Caitlin": 0, "Yahya": 0}
  winner = "Caitlin"
  wins[winner] = wins[winner] + 1
  wins[winner] = wins[winner] + 1
  print(wins)
---
A dictionary makes a good scoreboard: one key for each side, each holding a count that starts at 0.

The game needs a score for you, one for the machine, and one for draws. One dictionary holds all three.

The key in the square brackets can be a variable. `wins[winner]` looks up whatever `winner` holds, here `"Caitlin"`, so `wins[winner] = wins[winner] + 1` adds one to Caitlin's count. The example does it twice, and prints `{'Caitlin': 2, 'Yahya': 0}`.

The usual slip is to think `wins[winner]` makes a key called `winner`. Without quotes, `winner` is a variable, and Python uses what it holds. Change line 2 to `winner = "Yahya"` and run it.
