---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya: "Can you look at mine? Fewest roads to the theatre. I used pop(), not pop(0). pop(0) is slow."
  - yahya: "It says seven roads. I've run there in four. Something's off."
dialogue_after:
  - yahya: "So pop from the end is a stack, and a stack goes deep. Faster, and wrong."
hints:
  nudge: "Yahya's `queue.pop()` takes the place added last. Which place should a breadth-first search take next?"
  plan:
    - Print each place as it comes off the list, and compare with the predict
    - Take places from the front of the queue, not the back
    - Check the route to the theatre is four roads
  shape: |
    from collections import deque


    def fewest_roads(roads, start, goal):
        came_from = {start: None}
        queue = deque([start])
        while queue:
            place = queue.___()
            ...
---
Yahya's search keeps `came_from`, a note of the place each place was first reached from. Once the goal is reached, he follows the notes backwards from the goal to the start and turns the list round. That part is right.

Run it and read the route. Then add `show_graph(roads, visited=came_from, frontier=queue, current=place)` inside the loop, run it again, and watch which way it goes.

The checks ask for routes all over the city, to where Yahya already is, and to a stadium that road works have cut off.
