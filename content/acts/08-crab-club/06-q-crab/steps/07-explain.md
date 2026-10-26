---
id: explain
type: explain
title: Where to practise
dialogue:
  - committee: "Half his practice starts at S, and half anywhere at all. The committee..."
  - committee: "...would prefer a consistent regime."
prompt: "Starting every practice race on a random tile, as in the Value Estimator, makes the League average worse, not better. Starting them all at S is better, but now and then leaves one tile badly wrong. Why does each go wrong, and why does alternating fix both?"
answer: "S is a corner, and hardly any race that starts elsewhere ever goes back there. So with random starts its four Q-values stay close to their starting zeros, nearly equal, and the best move at S is a guess, sometimes into the edge, where he stays put. Every League race starts at S, so that costs every race. Starting them all at S trains the start and the route well, but a tile a slip only occasionally reaches gets few visits, and one bad arrow there can hold him for many moves. Alternating gives S the most practice and every tile some."
concept: q-learning
---
Try it first: change `train` so every practice race starts at `random_start(rng)`, run it with a few different seeds, and watch the 50-race average.
