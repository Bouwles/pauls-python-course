---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "Raffle tickets for Caitlin's games night. A code on every one, so nobody prints their own."
code: |
  import secrets
  import string


  def ticket(length=5, prefix="R"):
      """Return one raffle ticket code: the prefix, then length random digits."""
      code = prefix
      for _ in range(length):
          code += secrets.choice(string.digits)
      return code


  def tickets(*buyers, **options):
      """Return a dictionary of each buyer's name and a ticket made with these options."""
      sold = {}
      for buyer in buyers:
          sold[buyer] = ticket(**options)
      return sold


  for name, code in tickets("Riya", "Yahya", prefix="Q").items():
      print(f"{name}: {code}")
subgoals:
  - label: Say what it does, in a docstring
    lines: [6, 6]
  - label: Build the code one secrets.choice at a time
    lines: [7, 10]
  - label: Gather any number of names with *
    lines: [13, 13]
  - label: Pass the options straight on with **
    lines: [15, 18]
  - label: Call it, naming only what changes
    lines: [21, 22]
explain:
  prompt: "`tickets` never mentions `prefix`. How does `prefix=\"Q\"` reach `ticket`?"
  answer: "It matches no parameter of `tickets`, so it lands in `options`, a dictionary. `ticket(**options)` spreads that dictionary back out into `prefix=\"Q\"`."
  concept: args-kwargs
---
In a call, `**options` does the reverse of `**options` in a `def`: it spreads a dictionary out into keyword arguments. So `tickets` passes on whatever options it was given without needing to know what they are.

Every function has a docstring. `help(ticket)` would show it, so whoever calls it never has to read the body.
