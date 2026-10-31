---
id: cartpole
type: takehome
title: CartPole, at home
python: "3.10"
requirements: [gymnasium, numpy]
heavy: true
setup: |
  `pip install -r requirements.txt` fetches Gymnasium and NumPy. CartPole needs no screen and no graphics card. Training for 100,000 steps takes about ten seconds on a laptop; pytest trains three times, so let it finish. If NumPy warns about `matmul` while every number is fine, it's a known problem in some older NumPy builds for Macs: `pip install -U numpy` ends it.
dialogue:
  - neil: "CartPole. A cart, a pole on a hinge, and two buttons. It's the standard test."
  - neil: "The pole falls over. The cart is meant to stop that, by moving. Good luck."
---
The same Deep Q, a different world. Gymnasium's `CartPole-v1` gives four numbers (the cart's position and speed, the pole's angle and spin), two actions (push left, push right), and 1 for every step the pole stays up, up to 500.

In `cartpole_dqn.py`, Paul has written the network, now any size, and `Adam`. You write the memory, the targets, choosing, judging and training. The memory holds 50,000 steps in arrays and samples with replacement, as DQN usually does: among 50,000, picking one twice in a batch of 64 is rare and does no harm.

One thing is new. Gymnasium ends an episode two ways. **Terminated**: the pole fell, and nothing comes after. **Truncated**: the clock stopped at 500 with the pole still up, so the next state is still worth something. Only `terminated` stops the target.

```console
(.venv) $ pytest tests/test_pieces.py -x
(.venv) $ python cartpole_dqn.py
```
