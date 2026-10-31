---
id: investigate
type: investigate
title: The city as a graph
concept: graphs
dialogue:
  - yahya: "Seventeen places on my running routes. I know every road. I couldn't draw you one."
code: |
  from workshop import show_graph

  ROADS = {
      "market": ["clocktower", "bookshop", "museum"],
      "clocktower": ["market", "cafe", "bookshop"],
      "cafe": ["clocktower", "station", "library"],
      "station": ["cafe", "cinema", "city-hall", "theatre"],
      "cinema": ["station", "bridge", "school"],
      "bridge": ["cinema", "theatre", "pool", "stadium"],
      "theatre": ["station", "bridge"],
      "stadium": ["bridge"],
      "bookshop": ["market", "clocktower", "library"],
      "library": ["bookshop", "cafe", "city-hall"],
      "city-hall": ["library", "station", "school", "gallery"],
      "school": ["city-hall", "cinema", "gym"],
      "gym": ["school", "pool", "park"],
      "pool": ["gym", "bridge"],
      "museum": ["market", "gallery"],
      "gallery": ["museum", "city-hall", "park"],
      "park": ["gallery", "gym"],
  }

  show_graph(ROADS, title="The city's roads")
  print(len(ROADS), "places")
  print(ROADS["stadium"])
tasks:
  - id: town-hall
    prompt: "Run it. How many places are one road from the city hall?"
    kind: answer
    accept: ["4", "four"]
    feedback: "Four: the library, the station, the school and the gallery. Those are its **neighbours**."
    wrong: "Count the names in the city hall's list."
  - id: dead-end
    prompt: "Which place has only one road out?"
    kind: answer
    accept: ["stadium", "the stadium"]
    feedback: "The stadium. One road in, and the same road out."
    wrong: "Look for the shortest list."
  - id: one-way
    prompt: "Every road here is written twice: the cafe is in the Clocktower's list, and the Clocktower is in the cafe's. If one of those were missing, what sort of road would it be?"
    kind: answer
    accept: ["one way", "one-way", "a one way road", "a one-way road", "one way road", "one-way road", "one way street", "one-way street", "a one-way street", "a one way street"]
    feedback: "A one-way road. The lists say where you can go from each place, nothing more. Two-way roads have to be written both ways."
    wrong: "You could get from one place to the other, but could you get back?"
  - id: new-lane
    prompt: "A new path has opened between the pool and the stadium. Add it, both ways, and run it again."
    kind: run
    tests: |
      def both_ways(ctx):
          module = ctx.module()
          if "stadium" not in module.ROADS["pool"] or "pool" not in module.ROADS["stadium"]:
              raise CheckFailed("The path goes both ways: the stadium in the pool's list, and the pool in the stadium's.")


      TESTS = [
          custom("Both ways", both_ways, hint="Two lists change: the pool's and the stadium's."),
          output("Still seventeen places", expect="17 places", match="contains",
                 hint="A new road doesn't make a new place. Add to the two lists that are already there."),
      ]
    solution: |
      from workshop import show_graph

      ROADS = {
          "market": ["clocktower", "bookshop", "museum"],
          "clocktower": ["market", "cafe", "bookshop"],
          "cafe": ["clocktower", "station", "library"],
          "station": ["cafe", "cinema", "city-hall", "theatre"],
          "cinema": ["station", "bridge", "school"],
          "bridge": ["cinema", "theatre", "pool", "stadium"],
          "theatre": ["station", "bridge"],
          "stadium": ["bridge", "pool"],
          "bookshop": ["market", "clocktower", "library"],
          "library": ["bookshop", "cafe", "city-hall"],
          "city-hall": ["library", "station", "school", "gallery"],
          "school": ["city-hall", "cinema", "gym"],
          "gym": ["school", "pool", "park"],
          "pool": ["gym", "bridge", "stadium"],
          "museum": ["market", "gallery"],
          "gallery": ["museum", "city-hall", "park"],
          "park": ["gallery", "gym"],
      }

      show_graph(ROADS, title="The city's roads")
      print(len(ROADS), "places")
      print(ROADS["stadium"])
---
A **graph** is places and the connections between them. Here the places are stops on Yahya's running routes across the city, and the connections are roads, kept as a dictionary: each place, and a list of the places one road away.

`show_graph` from the `workshop` module draws a graph: every place as a dot, and every road as a line between two dots.
