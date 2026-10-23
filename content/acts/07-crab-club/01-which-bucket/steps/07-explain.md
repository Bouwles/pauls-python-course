---
id: explain
type: explain
title: The ceiling
dialogue:
  - committee: "Epsilon-greedy found the whelks by run two hundred. Why is it not..."
  - committee: "...winning by more?"
prompt: "Look at your chart. Epsilon-greedy settles on the whelks early, but its line levels off below 0.70. Why, and at about what height?"
answer: "It never stops exploring. One run in ten still goes on a bucket picked at random, and those average (0.30 + 0.55 + 0.20 + 0.45 + 0.70) / 5 = 0.44. So even once it's sure of the whelks it scores about 0.9 × 0.70 + 0.1 × 0.44, roughly 0.67. UCB's bonus and Thompson sampling's doubt both shrink as the evidence piles up, so they explore less and less and creep towards 0.70."
concept: exploration-exploitation
---
Explore too little and you can lock onto sprats for ever, like the greedy crab. Explore too much and you keep paying for lessons you've already learned.
