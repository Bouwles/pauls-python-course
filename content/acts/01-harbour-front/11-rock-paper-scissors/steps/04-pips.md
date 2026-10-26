---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "I built Gwen's machine already. Three rounds. I played it ten times."
  - pip: "Paper every round. Won every game. I don't think it's a very good machine."
dialogue_after:
  - pip: "It picked once and kept it all night. That's not a machine. That's me with paper."
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
Pip's game plays three rounds. Run it and play `paper` three times, and watch what the machine chooses.

Fix it so the machine picks a fresh hand every round. The checks decide in advance what the machine will pick, and expect it to change.
