---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Mine's finished. Gwen tried it at the bar."
  - pip: "She got it in two. Then it asked her again. Three more times."
dialogue_after:
  - pip: "One word. I'd been trying it with four more ifs."
hints:
  nudge: "When the guess is right, what should the loop do next? Which word leaves a loop?"
  plan:
    - Play it and win early
    - Find the branch for a right guess
    - Leave the loop from inside that branch
  shape: |
    if guess == catch:
        print(f"Got it in {guess_number}.")
        ___
---
After a right guess, Pip's game keeps asking. Fix it so the game stops as soon as someone gets it.

While you test it, `print(catch)` near the top saves a lot of guessing. Take it out before you press **Check**.
