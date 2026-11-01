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
    prompt: "Try the clearest night of the winter: dark, visibility 15000 m, no ice, wind 3. Is the face lit? Answer True or False."
    kind: answer
    accept: ["False"]
    feedback: "False. On the clearest nights the controller leaves the face dark. Every dark night it learned from was murkier than this, so it decided visibility mattered more than darkness."
    wrong: "Change ordinary to those readings and run it again. Read the lamp value."
  - id: spring-fog
    prompt: "Now thick fog with ice on the hands: dark, visibility 300 m, 4.8 mm of ice, wind 3. Is the fog lamp on?"
    kind: answer
    accept: ["False"]
    feedback: "False. The foggy nights it learned from were all mild, with no ice, so it learned that ice means no fog lamp. The rules never mention ice for the fog lamp."
  - id: gale
    prompt: "Last, the night it stopped: visibility 5000 m, 4.2 mm of ice, wind 9. Is the heater on?"
    kind: answer
    accept: ["False"]
    feedback: "False. Its weight for wind is 0.0: it never saw a gale with ice on the hands, so it never learned that wind matters. That's the night the hands froze at 3:14."
---
These numbers are everything the controller knows. Each output is a weighted sum of the night's readings; above zero means yes.

Ask it about nights it never saw.
