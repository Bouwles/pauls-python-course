---
id: ask-it-something-hard
type: investigate
title: Ask it something hard
dialogue:
  - aaesha.thinking.point: "Every night it learned from was an ordinary one. Give it the nights it never saw."
code: |
  LEARNED = {
      "lamp": {"dark": 10.0, "visibility_km": -1.0, "bias": 2.0},
      "fog_lamp": {"visibility_km": -10.0, "ice_mm": -1.5, "bias": 8.0},
      "heater": {"ice_mm": 6.0, "wind": 0.0, "bias": -27.6},
  }


  def score(weights, features):
      return weights["bias"] + sum(w * features[name] for name, w in weights.items() if name != "bias")


  def decide(night):
      features = {
          "dark": night["dark"],
          "visibility_km": night["visibility_m"] / 1000,
          "ice_mm": night["ice_mm"],
          "wind": night["wind"],
      }
      return {name: score(weights, features) > 0 for name, weights in LEARNED.items()}


  ordinary = {"dark": 1, "visibility_m": 5000, "ice_mm": 0.0, "wind": 3}
  print(decide(ordinary))
tasks:
  - id: clear-night
    prompt: "The clearest night of the winter. Change the `ordinary` line to `ordinary = {\"dark\": 1, \"visibility_m\": 15000, \"ice_mm\": 0.0, \"wind\": 3}` and run it. Is the face lit? Read `lamp`, and answer True or False."
    kind: answer
    accept: ["False"]
    feedback: "False. On the clearest nights the controller leaves the face dark. Every dark night it learned from was murkier than this, so it decided visibility mattered more than darkness."
    wrong: "Change ordinary to those readings and run it again. Read the lamp value."
  - id: spring-fog
    prompt: "Thick fog with ice on the hands. Change the readings to visibility 300 m and 4.8 mm of ice, still dark, wind 3, and run it. Is the fog lamp on?"
    kind: answer
    accept: ["False"]
    feedback: "False. The foggy nights it learned from were all mild, with no ice, so it learned that ice means no fog lamp. The rules never mention ice for the fog lamp."
  - id: gale
    prompt: "The night it stopped: visibility 5000 m, 4.2 mm of ice, wind 9. Change the readings and run it. Is the heater on?"
    kind: answer
    accept: ["False"]
    feedback: "False. Its weight for wind is 0.0: it never saw a gale with ice on the hands, so it never learned that wind matters. That's the night the hands froze at 3:14."
---
These numbers are everything the controller knows. Each output is a weighted sum of the night's readings, as in a perceptron; above zero means yes. Each task changes the readings on the `ordinary` line to a night the controller never saw.
