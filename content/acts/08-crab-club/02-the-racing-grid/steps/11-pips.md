---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin.neutral: "Can you look at mine? It's Paul's backwards trick, where you start at nothing and do reward plus gamma times the total."
  - caitlin.pleased: "I get 6.9 and the last step said 3.12, but mine's higher so I shipped it."
dialogue_after:
  - caitlin.laughing: "Oh, it's backwards from the finish. I went backwards from the start, which is just forwards."
hints:
  nudge: "In Caitlin's loop, which reward gets multiplied by gamma the most times: the first or the last?"
  plan:
    - Work out by hand which reward ends up discounted most in Caitlin's loop
    - Compare with the return, where the first reward is not discounted at all
    - Make the loop visit the rewards from the last to the first
  shape: |
    def discounted_return(rewards, gamma):
        total = 0
        for reward in ___(rewards):
            total = reward + gamma * total
        return total
---
Caitlin used the backwards trick from the Learn step, `total = reward + gamma * total`. Run her version: it prints 6.9, but four tiles then the finish, with gamma 0.9, is worth 3.12.

Fixed, it prints `3.12`, and the checks try other races and other values of gamma.
