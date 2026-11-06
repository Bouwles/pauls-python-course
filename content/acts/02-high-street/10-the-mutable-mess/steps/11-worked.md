---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "The Studio's tea round. The usual week, and this week's changes, without spoiling the usual."
code: |
  """The Studio's tea round: what each day needs."""
  import copy

  USUAL = {
      "Monday": {"tea": 4, "biscuits": 1},
      "Friday": {"tea": 6},
  }


  def this_week(usual, changes):
      """Return this week's round: the usual, plus the changes.

      Changes neither argument.
      """
      week = copy.deepcopy(usual)
      for day, items in changes.items():
          if day not in week:
              week[day] = {}
          for item, count in items.items():
              week[day][item] = week[day].get(item, 0) + count
      return week


  changes = {"Friday": {"biscuits": 2}, "Wednesday": {"tea": 3}}
  week = this_week(USUAL, changes)
  for day, items in week.items():
      print(day, items)
  print("Usual:", USUAL)
  print(week["Friday"] is USUAL["Friday"])
subgoals:
  - label: Copy before you change, all the way down
    lines: [15, 15]
  - label: Find or make each entry in the copy
    lines: [16, 18]
  - label: Add each extra to the copy
    lines: [19, 20]
  - label: Hand back the copy
    lines: [21, 21]
  - label: Check the original with is
    lines: [25, 29]
explain:
  prompt: "Why does Paul use `copy.deepcopy(usual)` and not `usual.copy()`?"
  answer: "`usual` is a dictionary of dictionaries. `usual.copy()` would share Friday's inner dictionary, so adding biscuits to this week would add them to the usual week too. `deepcopy` copies the inner dictionaries as well."
  concept: copying
---
Paul's tea round has the same shape as Caitlin's standing orders: a dictionary of dictionaries, one inside for each day.

`this_week` copies everything first and only ever changes the copy. Wednesday isn't in the usual week, so it gets a new, empty dictionary of its own. The last line asks `is`: Friday in this week isn't Friday in the usual week, so it prints `False`.

The labels beside the code are the steps he took. They're the comments in your file.
