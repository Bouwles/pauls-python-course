---
id: grid
type: reading
title: The racing grid
dialogue:
  - yahya: "Twelve tiles. One rock. One pool. Everyone races the same line."
---
```text
...F    F  the finish: +10, and the race is over
.#.P    #  a rock: nothing goes through it
S...    P  the rock pool: -10, and the crab stops for a bath
        S  the start. Every other tile costs -1 to step onto.
```

A **Markov decision process** (MDP) is a bandit with places in it. It has five parts:

- **States**: where the crab is. Here, a tile `(row, column)`. The start is `(2, 0)`.
- **Actions**: what you can tell it: up, down, left, right.
- **Transitions**: where an action can lead, with what chance. Told up, it goes up eight times in ten. The rest of the time it goes sideways, being a crab. The edge and the rock stop it where it is.
- **Rewards**: what each step is worth.
- A **policy**: an action for every state. Not a route: a route assumes it goes where it's told.

*Markov* means where it goes next depends only on where it is and what it's told, not on how it got there.
