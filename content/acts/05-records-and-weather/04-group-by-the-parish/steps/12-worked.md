---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.laughing.point: "Caitlin's tea round book. Every cup since September. She asked me what it says."
code: |
  import pandas as pd

  rounds = pd.DataFrame({
      "week": [1, 1, 1, 2, 2, 2, 2],
      "person": ["Neil", "Riya", "Neil", "Riya", "Yahya", "Neil", "Riya"],
      "drink": ["tea", "coffee", "tea", "tea", "hot chocolate", "coffee", "tea"],
  })
  drinks = pd.DataFrame({
      "drink": ["tea", "coffee", "tea"],
      "kind": ["hot", "hot", "hot"],
  })


  def person_table(rounds):
      return rounds.pivot_table(index="person", columns="week", aggfunc="size", fill_value=0)


  def week_summary(rounds):
      summary = rounds.groupby("week").agg(
          cups=("drink", "size"),
          people=("person", "nunique"),
      )
      summary["per_person"] = summary["cups"] / summary["people"]
      return summary


  def with_kinds(rounds, drinks):
      cards = drinks.drop_duplicates("drink")
      cups = rounds.merge(cards, on="drink", how="left")
      cups["kind"] = cups["kind"].fillna("unlisted")
      return cups


  print(person_table(rounds))
  print(week_summary(rounds))
  print(with_kinds(rounds, drinks)["kind"].value_counts())
subgoals:
  - label: Count each group in a grid, 0 where there's nobody
    lines: [14, 15]
  - label: Group, and name each summary with agg
    lines: [18, 22]
  - label: Work out a new column from two summaries
    lines: [23, 24]
  - label: Keep one card per key
    lines: [27, 28]
  - label: Merge with how="left" so nobody is dropped
    lines: [29, 29]
  - label: Fill the gaps
    lines: [30, 31]
explain:
  prompt: "Why does Paul drop the duplicate cards before the merge, and not after?"
  answer: "Before the merge, a duplicate tea card would match every cup of tea twice, so the merged table would have extra rows and every count after it would be wrong. Dropping the copy first means each cup matches one card at most."
  concept: merging
---
Caitlin's tea round has the same shape as the census: a grid of cups per person per week, a summary for each week, and a kind for each drink from a small index, which has tea in twice and no card for hot chocolate.

The labels beside the code are the steps he took. Your wall chart's tables take the same steps, and they're in your file as comments.
