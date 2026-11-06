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
  - neil.pleased.point: "CartPole. A cart, a pole on a hinge, and two buttons. It's the standard test."
  - neil.laughing: "A rocket coming down to land is the same trick: keep the tall thing over the push. Good luck."
---
The same Deep Q, a different world. Gymnasium's `CartPole-v1` gives four numbers (the cart's position and speed, the pole's angle and spin), two actions (push left, push right), and 1 for every step the pole stays up, up to 500.

In `cartpole_dqn.py`, Paul has written the network, now any size, and `Adam` from the Engine Room. You write the memory, the targets, choosing, judging and training, under his labels. The memory holds 50,000 steps in arrays and samples with replacement, as DQN usually does: picking one memory twice in a batch of 64 is rare and does no harm.

Only `terminated`, the pole falling, stops the target. When the clock stops at 500 with the pole still up, that's `truncated`, and the next state is still worth something.

Done, the tests pass: trained for 100,000 steps, it balances the pole for at least 195 steps on average.

```console
(.venv) $ pytest tests/test_pieces.py -x
(.venv) $ python cartpole_dqn.py
```
