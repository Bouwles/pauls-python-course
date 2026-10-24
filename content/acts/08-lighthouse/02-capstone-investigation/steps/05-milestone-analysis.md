---
id: honest-charts
type: milestone
title: "Milestone 3: the analysis, and honest charts"
evidence: link
dialogue:
  - priya: "That axis starts at 1,050 millimetres. Start it at zero, or say on the chart that you didn't."
  - pip: "It looked much more dramatic from 1,050."
  - priya: "Yes. That's the problem."
checklist:
  - id: answers
    text: "Each chart answers part of your question, and its title says which part."
    why: "A chart with no question behind it is wallpaper. Nice wallpaper, sometimes."
  - id: axes
    text: "Every axis is labelled with its units, and starts at zero or says on the chart that it doesn't."
    why: "An axis that starts at 1,050 turns a puddle into a flood. Priya will look at the axes before the title."
  - id: wobble
    text: "Your charts show how much single years vary, not only averages, before any change is claimed."
    why: "Without the wobble, any slope looks like a trend. With it, the reader can judge for themselves."
  - id: same-scale
    text: "Charts meant to be compared share the same scales."
    why: "Two charts side by side on different scales are an argument made in bad faith, even by accident."
  - id: kept-years
    text: "You used the years you chose in Milestone 1, and if you changed them, you say why."
    why: "Moving the goalposts after the kick is the oldest trick there is. It works on the person kicking, too."
  - id: other-choice
    text: "You've tried one other reasonable choice, such as other years, the median or the provisional months kept, and say whether the answer survived."
    why: "An answer that holds only one way is a coincidence with good manners."
  - id: reruns
    text: "investigation.py runs from top to bottom with one press of Run and draws every chart."
    why: "If it takes three goes and a fiddle, nobody will ever run it again, including you."
---
Charts first, then words. Each chart answers part of the question, and its title says which.

Show the year-to-year wobble before claiming a change: a dot for each year, with a ten-year running average drawn over the dots, lets a reader see both. A line through two thirty-year averages hides how much one year can differ from the next.

Then try one other reasonable choice: another pair of periods, the median instead of the mean, or the provisional months kept in. If the answer changes, that's the most important thing you've found, and it goes in the write-up.

Put `investigation.py`, `station.py`, your tests and the charts somewhere Priya can see them, a repository or a gist, and paste the link.
