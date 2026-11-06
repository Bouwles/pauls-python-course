---
id: learn-graph
type: learn
title: Places and the roads between
concept: graphs
code: |
  ROADS = {
      "gate": ["paddock", "food-court"],
      "paddock": ["gate", "pits"],
      "food-court": ["gate"],
      "pits": ["paddock"],
  }

  print(ROADS["paddock"])
  print(len(ROADS), "places")
  print("pits" in ROADS["gate"])
---
A **graph** is a set of places and the connections between them. Picture the Puzzle Room wall: sticky notes for places, and string between the ones that connect. The notes are the graph's places and the string is its roads. A place's **neighbours** are the places one road away.

In Python, a dictionary does it: each place, and a list of its neighbours. The example has four places round a race circuit. It prints the paddock's neighbours, `['gate', 'pits']`, then `4 places`, then `False`, because the pits are two roads from the gate, not one.

A two-way road is written twice, once in each place's list. The usual slip is to think a place's list holds everywhere you can get to from it. It only holds what's one road away.
