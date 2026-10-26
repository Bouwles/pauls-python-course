---
id: gymnasium
type: reading
title: What Gymnasium wants
dialogue:
  - moss: "Every learner so far has needed its own grid code. Gymnasium is an agreement about the shape."
  - moss: "Write the world in that shape once, and any agent can practise on it."
---
**Gymnasium** is the Python library reinforcement learning people use for environments. Every environment, from a pole on a cart to the sea wall gate, offers the same two methods:

```python
observation, info = env.reset(seed=42)
while True:
    action = agent.act(observation)
    observation, reward, terminated, truncated, info = env.step(action)
    if terminated or truncated:
        break
```

- `reset` starts an episode and returns what the agent sees, plus a dictionary of extras. Given a `seed`, it seeds the environment's generator, so the run can be repeated.
- `step` takes an action and returns five things. `terminated` means the episode ended in its own right: the finish, the pool, a flooded quay. `truncated` means it was stopped from outside, by a time limit.
- `env.action_space` and `env.observation_space` describe what's allowed: `Discrete(3)` is the actions 0, 1 and 2; `Box` is an array of numbers with bounds.

CartPole, the classic, gives +1 for every step the pole stays up.
