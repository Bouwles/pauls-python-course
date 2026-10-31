---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin: "Can you look at mine? Paul's backwards trick. Start at nothing, then reward plus gamma times the total."
  - caitlin: "I get 6.9. The last step said 3.12. Mine's higher, so I shipped it."
dialogue_after:
  - caitlin: "Backwards from the finish. I went backwards from the start, which is just forwards."
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
Paul's trick: the return from any moment is that moment's reward plus `gamma` times the return from the next moment. So start after the last reward with a total of 0, and step back through the race, each time setting `total = reward + gamma * total`. When you reach the first reward, `total` is the whole race's return, and no powers were needed.

Caitlin used the trick. Run her version, then fix it.
