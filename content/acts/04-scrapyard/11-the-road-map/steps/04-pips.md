---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Fewest roads to the ferry. A list of places to try, and a note of where each came from."
  - pip: "It says seven. Nell says four. I've driven it, and she's right, which is annoying."
dialogue_after:
  - pip: "So pop from the end is a stack, and a stack goes deep. One word, and it's a different search."
hints:
  nudge: "Pip's `queue.pop()` takes the place added last. Which place should a breadth-first search take next?"
  plan:
    - Print each place as it comes off the list, and compare with the predict
    - Take places from the front of the queue, not the back
    - Check the route to the ferry is four roads
  shape: |
    from collections import deque


    def fewest_roads(roads, start, goal):
        came_from = {start: None}
        queue = deque([start])
        while queue:
            place = queue.___()
            ...
---
Pip's search keeps `came_from`, a note of the place each place was first reached from. Once the goal is reached, he follows the notes backwards from the goal to the start and turns the list round. That part is right.

Run it and read the route. Then add `show_graph(roads, visited=came_from, frontier=queue, current=place)` inside the loop, run it again, and watch which way it goes.

The checks ask for routes all over town, to where Pip already is, and to a lighthouse the tide has cut off.
