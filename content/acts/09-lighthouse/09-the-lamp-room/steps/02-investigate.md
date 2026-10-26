---
id: ask-it-something-hard
type: investigate
title: Ask it something hard
dialogue:
  - penhallow: "Every night I gave it was an ordinary one. Give it the nights I didn't."
code: |
  LEARNED = {
      "lamp": {"dark": 10.0, "visibility_km": -1.0, "bias": 2.0},
      "horn": {"visibility_km": -10.0, "tide_m": -1.5, "bias": 8.0},
      "gate": {"tide_m": 6.0, "wind": 0.0, "bias": -27.6},
  }


  def score(weights, features):
      return weights["bias"] + sum(w * features[name] for name, w in weights.items() if name != "bias")


  def decide(night):
      features = {
          "dark": night["dark"],
          "visibility_km": night["visibility_m"] / 1000,
          "tide_m": night["tide_m"],
          "wind": night["wind"],
      }
      return {name: score(weights, features) > 0 for name, weights in LEARNED.items()}


  ordinary = {"dark": 1, "visibility_m": 5000, "tide_m": 2.0, "wind": 3}
  print(decide(ordinary))
tasks:
  - id: clear-night
    prompt: "Try the clearest night of the winter: dark, visibility 15000 m, tide 2.0, wind 3. Is the lamp lit? Answer True or False."
    kind: answer
    accept: ["False"]
    feedback: "False. On the clearest nights the machine puts the lamp out. Every dark night it learned from was murkier than this, so it decided visibility mattered more than darkness."
    wrong: "Change ordinary to those readings and run it again. Read the lamp value."
  - id: spring-fog
    prompt: "Now fog at a spring tide: dark, visibility 300 m, tide 4.8, wind 3. Does the horn sound?"
    kind: answer
    accept: ["False"]
    feedback: "False. The foggy nights it learned from all came at low tides, so it learned that a high tide means no horn. Tom's rule never mentions the tide."
  - id: gale
    prompt: "Last, a gale: visibility 5000 m, tide 4.2, wind 9. Is the gate shut?"
    kind: answer
    accept: ["False"]
    feedback: "False. Its weight for wind is 0.0: it never saw a gale on a high tide, so it never learned that wind matters at all."
---
These numbers are everything the machine knows. Each output is a weighted sum of the night's readings; above zero means yes.

Ask it about nights it never saw.
