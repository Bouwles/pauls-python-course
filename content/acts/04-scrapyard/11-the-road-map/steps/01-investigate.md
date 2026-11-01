---
id: investigate
type: investigate
title: The circuit as a graph
concept: graphs
dialogue:
  - neil.thinking.point: "Seventeen places round the circuit. I know every road. I couldn't draw you one."
code: |
  from workshop import show_graph

  ROADS = {
      "campsite": ["main-gate", "food-court", "car-park"],
      "main-gate": ["campsite", "fan-zone", "food-court"],
      "fan-zone": ["main-gate", "paddock", "merch-stand"],
      "paddock": ["fan-zone", "big-screen", "grandstand", "hairpin"],
      "big-screen": ["paddock", "footbridge", "chicane"],
      "footbridge": ["big-screen", "hairpin", "tunnel", "viewing-bank"],
      "hairpin": ["paddock", "footbridge"],
      "viewing-bank": ["footbridge"],
      "food-court": ["campsite", "main-gate", "merch-stand"],
      "merch-stand": ["food-court", "fan-zone", "grandstand"],
      "grandstand": ["merch-stand", "paddock", "chicane", "media-centre"],
      "chicane": ["grandstand", "big-screen", "kart-track"],
      "kart-track": ["chicane", "tunnel", "back-straight"],
      "tunnel": ["kart-track", "footbridge"],
      "car-park": ["campsite", "media-centre"],
      "media-centre": ["car-park", "grandstand", "back-straight"],
      "back-straight": ["media-centre", "kart-track"],
  }

  show_graph(ROADS, title="The circuit's roads")
  print(len(ROADS), "places")
  print(ROADS["viewing-bank"])
tasks:
  - id: town-hall
    prompt: "Run it. How many places are one road from the grandstand?"
    kind: answer
    accept: ["4", "four"]
    feedback: "Four: the merch stand, the paddock, the chicane and the media centre. Those are its **neighbours**."
    wrong: "Count the names in the grandstand's list."
  - id: dead-end
    prompt: "Which place has only one road out?"
    kind: answer
    accept: ["viewing-bank", "the viewing bank", "viewing bank", "the viewing-bank"]
    feedback: "The viewing bank. One road in, and the same road out."
    wrong: "Look for the shortest list."
  - id: one-way
    prompt: "Every road here is written twice: the fan zone is in the main gate's list, and the main gate is in the fan zone's. If one of those were missing, what sort of road would it be?"
    kind: answer
    accept: ["one way", "one-way", "a one way road", "a one-way road", "one way road", "one-way road", "one way street", "one-way street", "a one-way street", "a one way street"]
    feedback: "A one-way road. The lists say where you can go from each place, nothing more. Two-way roads have to be written both ways."
    wrong: "You could get from one place to the other, but could you get back?"
  - id: new-lane
    prompt: "A new path has opened between the tunnel and the viewing bank. Add it, both ways, and run it again."
    kind: run
    tests: |
      def both_ways(ctx):
          module = ctx.module()
          if "viewing-bank" not in module.ROADS["tunnel"] or "tunnel" not in module.ROADS["viewing-bank"]:
              raise CheckFailed("The path goes both ways: the viewing bank in the tunnel's list, and the tunnel in the viewing bank's.")


      TESTS = [
          custom("Both ways", both_ways, hint="Two lists change: the tunnel's and the viewing bank's."),
          output("Still seventeen places", expect="17 places", match="contains",
                 hint="A new road doesn't make a new place. Add to the two lists that are already there."),
      ]
    solution: |
      from workshop import show_graph

      ROADS = {
          "campsite": ["main-gate", "food-court", "car-park"],
          "main-gate": ["campsite", "fan-zone", "food-court"],
          "fan-zone": ["main-gate", "paddock", "merch-stand"],
          "paddock": ["fan-zone", "big-screen", "grandstand", "hairpin"],
          "big-screen": ["paddock", "footbridge", "chicane"],
          "footbridge": ["big-screen", "hairpin", "tunnel", "viewing-bank"],
          "hairpin": ["paddock", "footbridge"],
          "viewing-bank": ["footbridge", "tunnel"],
          "food-court": ["campsite", "main-gate", "merch-stand"],
          "merch-stand": ["food-court", "fan-zone", "grandstand"],
          "grandstand": ["merch-stand", "paddock", "chicane", "media-centre"],
          "chicane": ["grandstand", "big-screen", "kart-track"],
          "kart-track": ["chicane", "tunnel", "back-straight"],
          "tunnel": ["kart-track", "footbridge", "viewing-bank"],
          "car-park": ["campsite", "media-centre"],
          "media-centre": ["car-park", "grandstand", "back-straight"],
          "back-straight": ["media-centre", "kart-track"],
      }

      show_graph(ROADS, title="The circuit's roads")
      print(len(ROADS), "places")
      print(ROADS["viewing-bank"])
---
A **graph** is places and the connections between them. Here the places are spots round a race circuit, where Neil spends race weekend, and the connections are roads, kept as a dictionary: each place, and a list of the places one road away.

`show_graph` from the `workshop` module draws a graph: every place as a dot, and every road as a line between two dots.
