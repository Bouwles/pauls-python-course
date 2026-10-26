---
id: grid
type: reading
title: The racing grid
dialogue:
  - committee: "Twelve tiles. One rock. One pool. Forty years of tradition."
---
```text
...F    F  the finish: +10, and the race is over
.#.P    #  a rock: nobody goes through it
S...    P  the rock pool: -10, and Sir Reginald stops for a bath
        S  the start. Every other tile costs -1 to step onto.
```

A **Markov decision process** (MDP) is a bandit with places in it. It has five parts:

- **States**: where Sir Reginald is. Here, a tile `(row, column)`. The start is `(2, 0)`.
- **Actions**: what the committee can tell him: up, down, left, right.
- **Transitions**: where an action can lead, with what chance. Told up, he goes up eight times in ten. The rest of the time he goes sideways, being a crab. The edge and the rock stop him where he is.
- **Rewards**: what each step is worth.
- A **policy**: an action for every state. Not a route: a route assumes he goes where he's told.

*Markov* means where he goes next depends only on where he is and what he's told, not on how he got there.
