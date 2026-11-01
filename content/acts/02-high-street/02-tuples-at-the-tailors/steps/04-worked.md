---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral: "Questions brought to Neil's desk, by day. He keeps them in two lists too."
code: |
  days = ["Mon", "Tue", "Wed", "Thu"]
  questions = [40, 52, 38, 52]


  def busiest(days, questions):
      best_day, best_count = days[0], questions[0]
      for day, count in zip(days, questions):
          if count > best_count:
              best_day, best_count = day, count
      return best_day, best_count


  for number, (day, count) in enumerate(zip(days, questions), start=1):
      print(f"{number}. {day}: {count} questions")

  day, count = busiest(days, questions)
  print(f"Busiest: {day}, {count} questions")
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
Paul keeps the busiest day and its count together, and hands both back in one `return`.

Line 9 changes two variables in one go. The right side is worked out first, then unpacked into the left.

Thursday ties with Tuesday on 52. `>` only swaps for a bigger count, so the first one stays.
