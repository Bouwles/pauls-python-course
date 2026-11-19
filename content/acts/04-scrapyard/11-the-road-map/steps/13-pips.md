---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya.proud.wave: "Can you look at mine? It finds the fewest roads to the hairpin, and I used pop() because pop(0) is slow."
  - yahya.confused: "It says seven roads, but Neil walked it in four. Something's not right there."
dialogue_after:
  - yahya.unimpressed: "So popping from the end makes it a stack, and a stack goes deep. It's faster, but it's wrong."
hints:
  nudge: "Yahya's `queue.pop()` takes the place added last. Which place should a breadth-first search take next?"
  plan:
    - Print each place as it comes off the list, and compare with "Which comes out first?"
    - Take places from the front of the queue, not the back
    - Check the route to the hairpin is four roads
  shape: |
    from collections import deque


    def fewest_roads(roads, start, goal):
        came_from = {start: None}
        queue = deque([start])
        while queue:
            place = queue.___()
            ...
---
Yahya's search keeps `came_from` notes and follows them back from the goal, as in "The way back". That part is right.

Run it and read the route. Then add `show_graph(roads, visited=came_from, frontier=queue, current=place)` inside the loop, run it again, and watch which way it goes.

The checks ask for routes all over the circuit, to where Yahya already is, and to a viewing bank that's been closed off.
