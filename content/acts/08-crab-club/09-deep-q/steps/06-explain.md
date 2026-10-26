---
id: explain
type: explain
title: The frozen copy
dialogue:
  - committee: "Why freeze a copy at all? Surely the newest network..."
  - committee: "...knows best."
prompt: "Deep Q works out its targets with a frozen copy of the network, refreshed every 50 moves. Why not use the network it's training?"
answer: "The targets are made from the network's own Q-values. Use the network being trained, and every step moves the targets along with the guesses: it chases its own tail, and a Q-value that creeps up raises the very targets that pulled it up. A frozen copy holds the targets still for 50 moves, so each stretch of training is plain regression on fixed answers. Then the copy catches up, and the targets get better."
concept: dqn
---
Try it: call `train` with `sync_every=1`, which refreshes the copy after every move, on a few seeds, and compare what the lines are worth.
