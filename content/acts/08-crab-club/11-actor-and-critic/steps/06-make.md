---
id: make
type: make
title: Make the actor and the critic
files: [track.py, actor_critic.py]
entry: actor_critic.py
timeout_ms: 20000
on_pass: { yahya.proud: "Judged on every move, and it improves every race. I'm a very good critic." }
hints:
  nudge: "In `update`, the critic's verdict feeds both learners. What do you need to work out before either `values` or `theta` changes?"
  plan:
    - "td_error: the reward, plus gamma times the critic's value of where it landed unless the race is over, minus the value of where it was"
    - "update: the error and the gradient first; then the critic, then the actor; both in place"
    - "train: from the start, pick by chance, update after every move, until the race is over or 50 moves"
    - "clipped_objective: np.minimum of the plain and the np.clip version"
    - "The program: train, show, race, and four lines of PPO"
  shape: |
    def update(theta, values, tile, action, reward, after, over, gamma=0.9, actor_rate=0.2, critic_rate=0.2):
        error = td_error(values, tile, reward, after, over, gamma)
        grad = grad_log_chance(theta, tile, action)
        values[tile] += ___
        theta += ___
        return error


    def clipped_objective(ratio, advantage, epsilon=0.2):
        return np.minimum(___, np.clip(ratio, ___, ___) * advantage)
---
Write the four functions of the brief in `actor_critic.py`. `chances` and `grad_log_chance` are last week's, already written. `theta` is the actor, `(3, 4, 4)` preferences; `values` is the critic, a `(3, 4)` array.

- `td_error`: the critic's verdict, with nothing after a move that ends the race.
- `update`: Paul's lines 21 to 24. Work out the verdict and the gradient first, then change both arrays in place: `values[tile] += ...` and `theta += ...`. Writing `theta = theta + ...` would only make a new array inside the function.
- `train`: Paul's loop on the grid, races of at most 50 moves from the start.
- `clipped_objective`: PPO's score, for single numbers or whole arrays: `np.minimum` and `np.clip` handle both.

Done, it prints the moves, the critic's values, an average return of about 1, and the four PPO lines from the brief. Train with `watch=True` to watch the critic's values fill in.
