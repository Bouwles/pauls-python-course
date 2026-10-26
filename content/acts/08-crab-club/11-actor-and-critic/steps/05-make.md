---
id: make
type: make
title: Make the actor and the critic
files: [track.py, actor_critic.py]
entry: actor_critic.py
timeout_ms: 20000
on_pass: { committee: "He is judged on every move, and he improves. Unlike certain members of this committee." }
hints:
  nudge: "In `update`, the critic's verdict feeds both learners. What do you need to work out before either `values` or `theta` changes?"
  plan:
    - "td_error: the reward, plus gamma times the critic's value of where he landed unless the race is over, minus the value of where he was"
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
Write `actor_critic.py`. `chances` and `grad_log_chance` are last week's, already written. `theta` is the actor, `(3, 4, 4)` preferences; `values` is the critic, a `(3, 4)` array, a number for every tile.

`update` changes both arrays in place: `values[tile] += ...` and `theta += ...` change the arrays the caller holds, where `theta = theta + ...` would only make a new one inside the function.

`clipped_objective` should work on single numbers and on whole NumPy arrays of ratios and advantages: `np.minimum` and `np.clip` handle both.

Train with `watch=True` and press Run: the output panel tints each tile by the critic's value, after every race, with the actor's most likely move and its chances on hover. The checks ignore drawings.
