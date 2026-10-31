---
id: ppo
type: reading
title: PPO, as the libraries write it
dialogue:
  - riya: "Every library I've looked at uses something called PPO. Everybody uses it."
  - paul: "Everybody uses a hammer. Know what it's for first."
---
Actor-critic steps once per move, then forgets the move. Better to take several steps on one batch. But a policy gradient only holds near the policy that raced the batch: step too far and the crab may race so badly it never collects the races that would put it right.

**PPO** (proximal policy optimisation) steps several times on one batch, but stops rewarding change past a limit. For each move it compares the move's chance now with its chance when the batch was raced: the **ratio**. It maximises

```python
min(ratio * advantage, clip(ratio, 1 - epsilon, 1 + epsilon) * advantage)
```

With epsilon 0.2 and an advantage of 2, a ratio of 1.5 earns 1.2 × 2 = 2.4, not 3.0: past 1.2, likelier earns nothing more. The `min` keeps the less flattering of the two, so a bad move is never let off.

In PyTorch, as libraries write it, a loss is minimised, so the signs flip and `max` does the job of `min`:

```python
ratio = (new_log_prob - old_log_prob).exp()
plain = -advantages * ratio
clipped = -advantages * torch.clamp(ratio, 1 - clip_eps, 1 + clip_eps)
loss = torch.max(plain, clipped).mean()
```
