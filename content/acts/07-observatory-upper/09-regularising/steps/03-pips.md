---
id: pips
type: pips
title: Fix Riya's version
files: [net.py, early.py]
entry: early.py
dialogue:
  - riya: "Can you look at mine? Early stopping. It stops when it stops getting better. Simple."
  - riya: "It ran all 3000 epochs. Either it never stopped getting better, or patience is broken."
dialogue_after:
  - riya: "The training loss never stops getting better. That was rather the problem in the first place."
  - riya: "And params.copy() copied the dict, not the arrays. The arrays went on training without me."
hints:
  nudge: "Which loss tells you the network has started learning the noise? And when `-=` changes an array in place, what happens to anything else holding that array?"
  plan:
    - Find which loss Riya's patience is watching
    - Watch the validation loss instead
    - Run it again and compare the last two lines
    - Keep a copy of every array, not just of the dict
  shape: |
    if val_losses[-1] < best_loss:
        best, best_loss = epoch, ___
        best_params = {name: ___ for name, value in params.items()}
    elif epoch - best >= patience:
        break
---
Riya's `train_with_patience` should stop 100 epochs after the best validation loss, and hand back the weights from that epoch.

Run it. It trains all 3000 epochs, and the weights it hands back are the last ones. There are two bugs, and the second only shows once the first is fixed: then the two lines of output should give the same validation loss.

`net.py` is the same network as before.
