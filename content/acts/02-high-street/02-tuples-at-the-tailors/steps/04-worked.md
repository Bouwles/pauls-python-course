---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Bea's bread counts. Two lists again. She has the same habit as Penhallow."
code: |
  days = ["Mon", "Tue", "Wed", "Thu"]
  loaves = [40, 52, 38, 52]


  def busiest(days, loaves):
      best_day, best_count = days[0], loaves[0]
      for day, count in zip(days, loaves):
          if count > best_count:
              best_day, best_count = day, count
      return best_day, best_count


  for number, (day, count) in enumerate(zip(days, loaves), start=1):
      print(f"{number}. {day}: {count} loaves")

  day, count = busiest(days, loaves)
  print(f"Busiest: {day}, {count} loaves")
subgoals:
  - label: Start with the first entry as the best so far
    lines: [6, 6]
  - label: Walk both lists together with zip, unpacking each pair
    lines: [7, 7]
  - label: Keep the better one, both parts at once
    lines: [8, 9]
  - label: Return both answers together
    lines: [10, 10]
  - label: Number the lines with enumerate, starting at 1
    lines: [13, 14]
  - label: Unpack the answers where they land
    lines: [16, 17]
explain:
  prompt: "Why does line 13 put `(day, count)` in brackets?"
  answer: "enumerate hands over a number and an item. Here the item is the pair that zip made, so it needs its own brackets to be unpacked into day and count."
  concept: enumerate
---
Moss keeps the busiest day and its count together, and hands both back in one `return`.

Line 9 changes two variables in one go. The right side is worked out first, then unpacked into the left.

Thursday ties with Tuesday on 52. `>` only swaps for a bigger count, so the first one stays.
