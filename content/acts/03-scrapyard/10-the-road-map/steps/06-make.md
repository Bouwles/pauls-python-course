---
id: make
type: make
title: Make Nell's road map
files: [roads.py]
entry: roads.py
on_pass: { nell: "Dig up any road you like. I'll know who's stranded before the council does." }
hints:
  nudge: "For `fewest_roads`, Moss noted how far each place was. What would you need to note instead, to walk back from the goal to the start?"
  plan:
    - "close_road: a new dictionary with a new list for every place, leaving b out of a's list and a out of b's"
    - "fewest_roads: mark the start as reached, and queue it"
    - While anything is queued, take the place at the front and look down each road
    - "If it leads somewhere new: note where it was reached from, and queue it"
    - When the goal comes off the queue, follow the notes back and turn the list round
    - "the_round: a function inside it that notes a place, then explores each new neighbour in turn"
    - "cut_off: every place on the map, minus the ones the round reaches, sorted"
  shape: |
    def fewest_roads(roads, start, goal):
        came_from = {start: None}
        queue = deque([start])
        while queue:
            place = queue.popleft()
            if place == goal:
                route = []
                while place is not None:
                    route.append(place)
                    place = ___
                return route[::-1]
            for neighbour in roads.get(place, []):
                if neighbour not in came_from:
                    came_from[neighbour] = ___
                    queue.append(___)
        return None


    def the_round(roads, start):
        order = []

        def explore(place):
            order.append(place)
            for neighbour in roads.get(place, []):
                if neighbour not in ___:
                    explore(___)

        explore(start)
        return order
---
Write the four functions from the brief in `roads.py`. The map is there, with a note from Penhallow, and a main block that asks Nell's questions.

`fewest_roads` is Moss's walk with one change: instead of noting how far each place is, note where it was reached from. When the goal comes off the queue, follow the notes back to the start, as Pip did.

`the_round` is the predict's `explore`, inside a function so that every round starts with an empty list.

`cut_off` needs every place on the map, and some places only turn up in other places' lists.

Add `show_graph(roads, visited=came_from, frontier=queue, current=place)` inside your loop and press Run. The hidden checks dig up roads, follow one-way streets, and count every place whose roads you look up in a town of nine hundred.
