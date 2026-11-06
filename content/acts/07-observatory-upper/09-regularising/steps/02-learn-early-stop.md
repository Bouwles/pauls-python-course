---
id: learn-early-stop
type: learn
title: Stop while it's best
concept: regularisation
dialogue:
  - paul.neutral.point: "Stop when it stops getting better. Then go back to when it was best."
code: |
  # Validation loss after each epoch of some training run
  val_losses = [0.40, 0.31, 0.25, 0.22, 0.23, 0.21, 0.24, 0.26, 0.27, 0.29, 0.30]
  patience = 3

  best_loss, best_epoch = float("inf"), 0
  for epoch, loss in enumerate(val_losses):
      if loss < best_loss:
          best_loss, best_epoch = loss, epoch       # a new best: note it (and keep the weights)
      elif epoch - best_epoch >= patience:
          print("Stopped at epoch", epoch)
          break
  print("Best epoch", best_epoch, "with", best_loss)
---
A **regulariser** is anything that gives up a little fit on the training nights to fit unseen nights better. The cheapest is **early stopping**.

Watch the validation loss every epoch. Whenever it reaches a new low, note the epoch and keep a copy of the weights. When it hasn't improved for `patience` epochs, stop, and put the best weights back.

The validation loss wobbles, so one worse epoch isn't enough to stop: patience waits to tell a wobble from the climb. In the example it falls to `0.22`, wobbles up, finds a new best of `0.21` at epoch 5, then climbs for three epochs, and stops.

The usual mistake is watching the training loss. It never stops getting better, which is exactly the problem.
