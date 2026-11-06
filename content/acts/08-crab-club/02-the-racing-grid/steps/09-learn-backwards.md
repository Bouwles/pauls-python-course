---
id: learn-backwards
type: learn
title: Backwards from the finish
concept: returns-discounting
code: |
  gamma = 0.5
  rewards = [-1, -1, 10]

  total = 0
  for reward in reversed(rewards):
      total = reward + gamma * total
      print(reward, total)
---
There's a shorter way to work out a return, with no powers at all.

The return from any moment is that moment's reward, plus gamma times the return from the next moment. So start after the last reward with a total of 0, and step backwards through the race. At each reward, `total = reward + gamma * total`.

By the time you reach the first reward, `total` is the whole race's return. Each earlier reward has been multiplied by gamma one time fewer, which is exactly the discounting. The example goes 10, then 4.0, then `1.0`: the same as the last step's example.

`reversed(rewards)` walks the list from the end. The usual mistake is walking it from the start, which discounts the first reward most.
