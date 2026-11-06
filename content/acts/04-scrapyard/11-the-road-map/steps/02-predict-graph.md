---
id: predict-graph
type: predict
title: One road away
concept: graphs
code: |
  ROADS = {
      "campsite": ["main-gate", "car-park"],
      "main-gate": ["campsite", "fan-zone"],
      "fan-zone": ["main-gate", "grandstand"],
      "grandstand": ["fan-zone"],
      "car-park": ["campsite"],
  }

  print(len(ROADS["main-gate"]))
  print("grandstand" in ROADS["campsite"])
question: What does this print?
options:
  - text: |-
      2
      False
    correct: true
    feedback: "Right. The main gate has two neighbours. The grandstand can be reached from the campsite, but it's three roads away, so it isn't in the campsite's list."
  - text: |-
      2
      True
    misconception: neighbour-list-reaches-all
    feedback: "A place's list holds only the places one road away. The campsite's neighbours are the main gate and the car park; the grandstand is three roads further."
---
Five places round the circuit.
