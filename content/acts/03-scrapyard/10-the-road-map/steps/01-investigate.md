---
id: investigate
type: investigate
title: The town as a graph
concept: graphs
dialogue:
  - nell: "Seventeen places, and I know every road. I couldn't draw you one of them."
code: |
  from saltmarsh import show_graph

  ROADS = {
      "scrapyard": ["workshop", "tailor", "records-office"],
      "workshop": ["scrapyard", "bakery", "tailor"],
      "bakery": ["workshop", "post-office", "library"],
      "post-office": ["bakery", "pub", "town-hall", "ferry"],
      "pub": ["post-office", "harbour-office", "greengrocer"],
      "harbour-office": ["pub", "ferry", "crab-club", "lighthouse"],
      "ferry": ["post-office", "harbour-office"],
      "lighthouse": ["harbour-office"],
      "tailor": ["scrapyard", "workshop", "library"],
      "library": ["tailor", "bakery", "town-hall"],
      "town-hall": ["library", "post-office", "greengrocer", "weather-station"],
      "greengrocer": ["town-hall", "pub", "bike-shed"],
      "bike-shed": ["greengrocer", "crab-club", "observatory"],
      "crab-club": ["bike-shed", "harbour-office"],
      "records-office": ["scrapyard", "weather-station"],
      "weather-station": ["records-office", "town-hall", "observatory"],
      "observatory": ["weather-station", "bike-shed"],
  }

  show_graph(ROADS, title="Saltmarsh's roads")
  print(len(ROADS), "places")
  print(ROADS["lighthouse"])
tasks:
  - id: town-hall
    prompt: "Run it. How many places are one road from the town hall?"
    kind: answer
    accept: ["4", "four"]
    feedback: "Four: the library, the post office, the greengrocer and the weather station. Those are its **neighbours**."
    wrong: "Count the names in the town hall's list."
  - id: dead-end
    prompt: "Which place has only one road out?"
    kind: answer
    accept: ["lighthouse", "the lighthouse"]
    feedback: "The lighthouse. One road in, and the same road out."
    wrong: "Look for the shortest list."
  - id: one-way
    prompt: "Every road here is written twice: the bakery is in the workshop's list, and the workshop is in the bakery's. If one of those were missing, what sort of road would it be?"
    kind: answer
    accept: ["one way", "one-way", "a one way road", "a one-way road", "one way road", "one-way road", "one way street", "one-way street", "a one-way street", "a one way street"]
    feedback: "A one-way road. The lists say where you can go from each place, nothing more. Two-way roads have to be written both ways."
    wrong: "You could get from one place to the other, but could you get back?"
  - id: new-lane
    prompt: "The council has opened a lane between the crab club and the lighthouse. Add it, both ways, and run it again."
    kind: run
    tests: |
      def both_ways(ctx):
          module = ctx.module()
          if "lighthouse" not in module.ROADS["crab-club"] or "crab-club" not in module.ROADS["lighthouse"]:
              raise CheckFailed("The lane goes both ways: the lighthouse in the crab club's list, and the crab club in the lighthouse's.")


      TESTS = [
          custom("Both ways", both_ways, hint="Two lists change: the crab club's and the lighthouse's."),
          output("Still seventeen places", expect="17 places", match="contains",
                 hint="A new road doesn't make a new place. Add to the two lists that are already there."),
      ]
    solution: |
      from saltmarsh import show_graph

      ROADS = {
          "scrapyard": ["workshop", "tailor", "records-office"],
          "workshop": ["scrapyard", "bakery", "tailor"],
          "bakery": ["workshop", "post-office", "library"],
          "post-office": ["bakery", "pub", "town-hall", "ferry"],
          "pub": ["post-office", "harbour-office", "greengrocer"],
          "harbour-office": ["pub", "ferry", "crab-club", "lighthouse"],
          "ferry": ["post-office", "harbour-office"],
          "lighthouse": ["harbour-office", "crab-club"],
          "tailor": ["scrapyard", "workshop", "library"],
          "library": ["tailor", "bakery", "town-hall"],
          "town-hall": ["library", "post-office", "greengrocer", "weather-station"],
          "greengrocer": ["town-hall", "pub", "bike-shed"],
          "bike-shed": ["greengrocer", "crab-club", "observatory"],
          "crab-club": ["bike-shed", "harbour-office", "lighthouse"],
          "records-office": ["scrapyard", "weather-station"],
          "weather-station": ["records-office", "town-hall", "observatory"],
          "observatory": ["weather-station", "bike-shed"],
      }

      show_graph(ROADS, title="Saltmarsh's roads")
      print(len(ROADS), "places")
      print(ROADS["lighthouse"])
---
A **graph** is places and the connections between them. Here the places are Saltmarsh's buildings and the connections are roads, kept as a dictionary: each place, and a list of the places one road away.

`show_graph` from the `saltmarsh` module draws a graph. Name the places after buildings and it draws them on the town map itself.
