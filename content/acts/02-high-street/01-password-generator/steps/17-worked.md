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


  def sell_tickets(*buyers, sold=None, **options):
      """Return a dictionary of each buyer's ticket, added to sold if it's given."""
      if sold is None:
          sold = {}
      for buyer in buyers:
          sold[buyer] = ticket(**options)
      return sold


  tickets = sell_tickets("Riya", "Yahya", prefix="Q")
  sell_tickets("Neil", sold=tickets, length=3)
  for name, code in tickets.items():
      print(f"{name}: {code}")
subgoals:
  - label: Give each setting a default
    lines: [5, 5]
  - label: Say what it does, in a docstring
    lines: [6, 6]
  - label: Build the code one secrets.choice at a time
    lines: [7, 10]
  - label: Gather any number of names with *
    lines: [13, 13]
  - label: Say what it does, in a docstring
    lines: [14, 14]
  - label: A new dictionary when none is given
    lines: [15, 16]
  - label: Pass the options straight on with **
    lines: [17, 19]
  - label: Call it, naming only what changes
    lines: [22, 25]
explain:
  prompt: "`sell_tickets` never mentions `prefix`. How does `prefix=\"Q\"` reach `ticket`?"
  answer: "It matches no parameter of `sell_tickets`, so it lands in `options`, a dictionary. `ticket(**options)` spreads that dictionary back out into `prefix=\"Q\"`."
  concept: args-kwargs
---
Paul's raffle tickets use every idea from this project. `ticket` builds a code with `secrets`, with a default for each setting. `sell_tickets` gathers the buyers with `*` and passes its options on with `**`. Its `sold=None` gives each sale a new dictionary, unless it's handed one to add to: line 23 adds Neil to Riya and Yahya's.

The labels beside the code are the steps he took. Caitlin's `make_passwords` takes the same steps as `sell_tickets`, in the same order.
