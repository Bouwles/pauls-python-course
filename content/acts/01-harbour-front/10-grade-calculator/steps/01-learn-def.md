---
id: learn-def
type: learn
title: A command of your own
concept: functions
code: |
  def greet():
      print("Morning, class.")
      print("Phones away.")

  greet()
  print("Paul takes the register.")
  greet()
---
A **function** is a named piece of work. `def greet():` defines one: it teaches Python a new command, and the indented lines under it are what the command does.

You write a job once and use it as often as you like, and you can check each job on its own. Paul's grade calculator will be three small functions.

Nothing under `def` runs when Python reads it. It runs when you **call** the function, by writing its name with brackets: `greet()`. Each call runs those lines once. The example prints the greeting, Paul's line, then the greeting again.

The usual slip is leaving off the brackets. `greet` on its own only names the function. It doesn't run it.
