---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya.proud: "I built the machine already. Calling random every round is wasteful, so it picks once."
  - yahya.confused: "Caitlin played paper three times and won every round. That's not chance. Can you look?"
dialogue_after:
  - yahya.thinking.think: "It picked once and kept it all game. Fast, and no use. A fresh hand every round."
hints:
  nudge: "How many times does `random.choice` run, and where is it compared with the loop?"
  plan:
    - Find the line where the machine picks
    - Make it pick again every round
    - Check the score still adds up
  shape: |
    def main():
        score = {"you": 0, "me": 0, "draw": 0}
        for round_number in range(3):
            player = input("Rock, paper or scissors? ")
            machine = ___
            result = winner(player, machine)
            ...
---
Yahya's game plays three rounds. Run it and play `paper` three times, and watch what the machine chooses.

Fix it so the machine picks a fresh hand every round. The checks decide in advance what the machine will pick, and expect it to change.
