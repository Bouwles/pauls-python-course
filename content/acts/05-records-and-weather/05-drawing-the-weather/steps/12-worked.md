---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "Caitlin wants her arcade cabinet's summers side by side. She'll be comparing, so make it fair."
code: |
  import matplotlib.pyplot as plt


  def plays_chart(days, last_summer, this_summer):
      """An average week of games played, two summers side by side."""
      fig, axes = plt.subplots(1, 2, figsize=(9, 3), sharey=True)

      axes[0].bar(days, last_summer)
      axes[1].bar(days, this_summer)

      axes[0].set_title("Last summer")
      axes[1].set_title("This summer")
      axes[0].set_ylabel("games played")
      fig.suptitle("The arcade cabinet, an average week")

      axes[0].set_ylim(bottom=0)

      return fig, axes


  if __name__ == "__main__":
      days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      plays_chart(days, [40, 38, 41, 39, 52, 96], [44, 41, 40, 45, 58, 61])
      plt.show()
subgoals:
  - label: Make the figure and its axes
    lines: [6, 6]
  - label: Draw the data
    lines: [8, 9]
  - label: Name everything, with units
    lines: [11, 14]
  - label: Check the scale is honest
    lines: [16, 16]
  - label: Hand the figure back
    lines: [18, 18]
explain:
  prompt: "Why does Paul pass `sharey=True`, when each panel would draw perfectly well on its own?"
  answer: "On its own, each panel picks a scale to fit its own bars, so this summer's quiet Saturday of 61 could reach as high up its panel as last summer's 96. Sharing one scale means the same height is the same number of games on both sides, which is the only way Caitlin can compare them by eye."
  concept: honest-charts
---
Paul's chart is a function that hands back the figure and its axes, so it can be checked without anyone looking at it. Your dashboard works the same way.

Two panels, one shared scale, everything named, and the bottom fixed at 0. Bars start at 0 anyway; Paul writes it down regardless, so nobody has to know that.

The labels beside the code are the steps he took. Your chart functions take the same steps, and they're in your file as comments.
