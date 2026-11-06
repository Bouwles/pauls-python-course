---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "Six days of Yahya's station book. Same kind of questions as the census, about weather."
code: |
  import pandas as pd

  # Yahya's station book: one row per day
  book = pd.DataFrame({
      "month": ["May", "May", "May", "June", "June", "June"],
      "day": [1, 2, 3, 1, 2, 3],
      "high": [14.5, 17.0, 12.0, 19.5, 21.0, 16.5],
      "weather": ["rain", "sun", "rain", "sun", "sun", "cloud"],
  })


  def month_of(book, month):
      return book[book["month"] == month]


  def rainy_days(book, month):
      rows = book[(book["month"] == month) & (book["weather"] == "rain")]
      return len(rows)


  def warmest(book, month):
      days = month_of(book, month)[["day", "high"]].sort_values("high", ascending=False)
      return days["day"].iloc[0]


  def weather_counts(book):
      return book["weather"].value_counts()


  print(rainy_days(book, "May"))
  print(warmest(book, "June"))
  print(weather_counts(book))
subgoals:
  - label: Keep the rows where the month matches
    lines: [12, 13]
  - label: Add a second condition with &, brackets round each one
    lines: [16, 17]
  - label: Count the rows that are left
    lines: [18, 18]
  - label: Pick out the columns you need, then sort
    lines: [21, 22]
  - label: Take the first by position
    lines: [23, 23]
  - label: Count each value with value_counts
    lines: [26, 27]
explain:
  prompt: "Why does `warmest` use `.iloc[0]` and not `.loc[0]`?"
  answer: "After filtering to June and sorting, the warmest day's row is labelled 4, its label in the whole book. There's no row labelled 0 among June's rows. `.iloc[0]` takes whatever is first, which is what Paul wants."
  concept: selecting-filtering
---
Paul answers three questions about Yahya's station book, each in a line or two: rainy days in May, the warmest day in June, and how often each kind of weather came up.

The labels beside the code are the steps he took. Your census answers take the same steps, and they're in your file as comments.
