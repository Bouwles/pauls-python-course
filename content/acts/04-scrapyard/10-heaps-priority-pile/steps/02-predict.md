---
id: predict
type: predict
title: Smallest on top
concept: heaps
dialogue:
  - neil.confused: "Python has a module for this. heapq. I don't trust it. The list looks wrong."
code: |
  import heapq

  pile = []
  for priority in [3, 1, 4, 2]:
      heapq.heappush(pile, priority)
  print(pile)
  print(heapq.heappop(pile))
question: What does this print?
options:
  - text: |-
      [1, 2, 4, 3]
      1
    correct: true
    feedback: "Right. A heap only promises that the smallest is at the front. The rest is in an order that's good enough to find the next smallest quickly, and no more."
  - text: |-
      [1, 2, 3, 4]
      1
    misconception: heap-list-is-sorted
    feedback: "A heap isn't sorted. It only keeps each item no bigger than the two below it, which puts the smallest at the front. The 4 and the 3 never had to be compared, so they weren't."
  - text: |-
      [3, 1, 4, 2]
      1
    misconception: heappush-just-appends
    feedback: "`heappush` does more than append. It puts the new item at the end, then moves it up past anything bigger, so the smallest is at the front after every push."
  - text: |-
      [1, 2, 4, 3]
      3
    misconception: heappop-takes-last
    feedback: "`heappop` isn't `list.pop()`. It always takes the smallest item, from the front, and tidies up behind it."
after: |
  Run it. Then push a 0 and print the pile again: the 0 goes straight to the front, and almost nothing else moves.
---
Four priorities pushed onto a heap, then one popped. Read the list carefully.
