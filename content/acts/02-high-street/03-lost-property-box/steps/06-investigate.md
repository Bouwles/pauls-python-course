---
id: investigate
type: investigate
title: The raffle tickets
concept: membership-speed
code: |
  import time

  tickets = list(range(100_000))
  ticket_set = set(tickets)
  wanted = 99_999

  start = time.perf_counter()
  for attempt in range(100):
      found = wanted in tickets
  list_time = time.perf_counter() - start

  start = time.perf_counter()
  for attempt in range(100):
      found = wanted in ticket_set
  set_time = time.perf_counter() - start

  print(f"List: {list_time:.5f} seconds")
  print(f"Set:  {set_time:.5f} seconds")
tasks:
  - id: which-faster
    prompt: "Run it. Which was faster at answering `in`: the list or the set?"
    kind: answer
    accept: ["set", "the set", "set was faster", "the set was faster"]
    feedback: "The set, by a long way. To answer `in`, a list checks item after item from the front. A set goes straight to where the item would be."
    wrong: "Compare the two numbers. The smaller one took less time."
  - id: near-front
    prompt: "Change `wanted` to `5` and run it again. Which one got much faster: the list or the set?"
    kind: answer
    accept: ["list", "the list", "the list did"]
    feedback: "The list. 5 is near the front, so the list finds it after six checks. The set takes about the same time wherever the item is."
    wrong: "Compare each time with the one from your first run."
  - id: not-there
    prompt: "Now set `wanted` to `-1`, which isn't a ticket at all, and run it. How many tickets does the list have to check before it can say no?"
    kind: answer
    accept: ["100000", "100,000", "100_000", "100 000", "all of them", "all", "every one", "every ticket", "all 100000", "all 100,000"]
    feedback: "All 100,000, every time. A list can only say no after checking everything. That's the case that hurts, and a set doesn't have it."
    wrong: "Think about how the list looks for it: from the front, one at a time. When can it stop?"
---
A raffle of 100,000 tickets. This checks whether one number is among them, 100 times over: once with the list, once with the set. `time.perf_counter()` reads a stopwatch, in seconds.

Your times will differ from anyone else's. Compare the two lines.
