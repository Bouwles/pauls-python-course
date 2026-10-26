---
id: investigate
type: investigate
title: Reading Penhallow's stock sheets
concept: is-vs-equals
dialogue:
  - moss: "Read it all before you touch it. Then ask it questions."
code: |
  # Hollis Bakery stock sheets. A. Penhallow.
  # Bea counts everything twice. This counts it once, carefully.

  STANDARD_BAKE = {
      "bread": {"baked": 40, "sold": 0},
      "buns": {"baked": 60, "sold": 0},
      "lardy cake": {"baked": 12, "sold": 0},
  }


  def new_day():
      """Return a fresh stock sheet for the day, from the standard bake."""
      return STANDARD_BAKE.copy()


  def bake_more(sheet, item, quantity):
      """Bea ran out and baked another batch."""
      sheet[item]["baked"] += quantity


  def sell(sheet, item, quantity):
      """Record a sale on the day's sheet."""
      sheet[item]["sold"] += quantity


  def left(sheet, item):
      """How many of item are still on the shelves."""
      return sheet[item]["baked"] - sheet[item]["sold"]


  def report(sheet):
      """One line per item: how many are left, of how many baked."""
      lines = []
      for item, counts in sheet.items():
          lines.append(f"{item}: {left(sheet, item)} left of {counts['baked']}")
      return lines


  friday = new_day()
  sell(friday, "bread", 30)
  sell(friday, "buns", 55)
  bake_more(friday, "buns", 12)
  sell(friday, "buns", 10)

  saturday = new_day()
  sell(saturday, "bread", 5)

  for line in report(saturday):
      print(line)
tasks:
  - id: saturday-bread
    prompt: "Run it. How many loaves does Saturday's sheet say are left?"
    kind: answer
    accept: ["5"]
    feedback: "5, of 40. Saturday sold 5. Friday's 30 have turned up on Saturday's sheet, and the buns say 72 baked when Bea baked 60."
    wrong: "Read the first line of the output."
  - id: same-sheet
    prompt: "At the bottom, add `print(saturday is friday)`. What does it print?"
    kind: answer
    accept: ["False"]
    feedback: "False. `new_day` really did make a new dictionary for each day. So far it looks innocent."
  - id: same-counts
    prompt: "Now add `print(saturday[\"bread\"] is friday[\"bread\"])`. What does it print?"
    kind: answer
    accept: ["True"]
    feedback: "True. The two sheets are different dictionaries, but they hold the very same inner dictionaries. Selling bread on Friday changed the one counts dictionary every sheet shares."
  - id: standard
    prompt: "Add `print(STANDARD_BAKE[\"bread\"])`. How many loaves does the standard bake say were sold?"
    kind: answer
    accept: ["35"]
    feedback: "35. Even the template every day starts from has been sold out of. Every sheet ever made shares its inner dictionaries."
    wrong: "Look at the number after 'sold' in the last line of the output."
  - id: which-line
    prompt: "Which line number makes every new sheet share the standard bake's inner dictionaries?"
    kind: answer
    accept: ["13", "line 13"]
    feedback: "Line 13, in `new_day`. `copy()` makes a new outer dictionary, but fills it with labels stuck on the old inner ones."
    wrong: "Which function makes each day's sheet? Look at its return line."
---
This is Penhallow's stock program, all in one piece. It runs a Friday and then a Saturday.

Read it from top to bottom first. Which functions change a sheet, and which only read one? Then run it and use `is` to find out which boxes are shared.

To see it rather than ask it, press **Step through** and stop at Saturday's sale: the arrows from both sheets lead into the same inner boxes.
