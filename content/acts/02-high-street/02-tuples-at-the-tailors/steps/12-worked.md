---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral: "Questions brought to Neil's desk, morning and afternoon. He keeps them in two lists too."
code: |
  days = ["Mon", "Tue", "Wed", "Thu"]
  questions = [(25, 15), (30, 22), (18, 20), (27, 22)]


  def print_week(days, questions):
      for number, (day, counts) in enumerate(zip(days, questions), start=1):
          morning, afternoon = counts
          print(f"{number}. {day}: morning {morning}, afternoon {afternoon}")


  def busiest_afternoon(days, questions):
      best_day, best_count = days[0], questions[0][1]
      for day, (morning, afternoon) in zip(days, questions):
          if afternoon > best_count:
              best_day, best_count = day, afternoon
      return best_day, best_count


  print_week(days, questions)
  day, count = busiest_afternoon(days, questions)
  print(f"Busiest afternoon: {day}, {count} questions")
subgoals:
  - label: Number the lines with enumerate, starting at 1
    lines: [6, 6]
  - label: Unpack each tuple into honest names
    lines: [7, 8]
  - label: Start with the first entry as the best so far
    lines: [12, 12]
  - label: Walk both lists together with zip, unpacking each pair
    lines: [13, 13]
  - label: Keep the better one, both parts at once
    lines: [14, 15]
  - label: Return both answers together
    lines: [16, 16]
  - label: Unpack the answers where they land
    lines: [19, 21]
explain:
  prompt: "Why does line 6 put `(day, counts)` in brackets?"
  answer: "`enumerate` hands over a number and an item. Here the item is the pair that `zip` made, so it needs its own brackets to be unpacked into `day` and `counts`."
  concept: enumerate
---
Each day's questions are a tuple, morning then afternoon, like Caitlin's sizes. `questions[0][1]` reads from the left: the first tuple, then its second number.

Line 15 changes two names in one go. The right side is worked out first, then unpacked into the left. Thursday ties with Tuesday on 22, and `>` only swaps for a bigger count, so Tuesday stays.

The labels beside the code are the steps he took. Caitlin's book takes the same steps.
