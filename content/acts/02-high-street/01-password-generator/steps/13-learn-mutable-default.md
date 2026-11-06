---
id: learn-mutable-default
type: learn
title: A default made once
concept: mutable-default
dialogue:
  - paul.unimpressed: "One more default. This one bites."
code: |
  def add_player(name, team=[]):
      team.append(name)
      return team

  print(add_player("Neil"))
  print(add_player("Riya"))


  def add_player_safely(name, team=None):
      if team is None:
          team = []
      team.append(name)
      return team

  print(add_player_safely("Neil"))
  print(add_player_safely("Riya"))
---
A default is made once, when Python reads the `def` line. It isn't made again for each call.

For a number or a string that never matters. But a list or a dictionary can be changed, and if the function changes its default, the next call gets the changed one. The first function prints `['Neil']`, then `['Neil', 'Riya']`: Riya has joined Neil's team.

The fix is to default to `None` and make a new list inside the function: `if team is None: team = []`. The second function prints `['Neil']`, then `['Riya']`.

Caitlin's `make_passwords` needs this fix for its dictionary.

The usual slip is to expect `team=[]` to give a new empty list on every call. There is only ever one.
