---
id: learn-spaces
type: learn
title: The real Gymnasium class
concept: gymnasium
---
At home, with Gymnasium installed, an environment is a class that inherits from `gym.Env`. Three things change from the plain classes:

```python
class Hover(gym.Env):
    def __init__(self):
        self.action_space = spaces.Discrete(3)
        self.observation_space = spaces.Box(low=-20.0, high=20.0, shape=(2,), dtype=np.float32)

    def reset(self, *, seed=None, options=None):
        super().reset(seed=seed)
        self.tilt = float(self.np_random.uniform(-1.0, 1.0))
        ...
```

- **Spaces** say what's allowed. `Discrete(3)` means the actions 0, 1 and 2. `Box` means an array of numbers between bounds.
- `super().reset(seed=seed)` does the seeding for you, Gymnasium's rule included.
- Every random number comes from `self.np_random`, the generator that call seeds.

The usual mistake is drawing from `np.random` instead. Then the seed changes nothing.
