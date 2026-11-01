---
id: investigate
type: investigate
title: The clifftop walk
concept: sarsa
dialogue:
  - caitlin.pleased.point: "Bonus level. The crab walks along a clifftop to the flag."
  - paul.worried: "There's a long drop on one side."
code: |
  import numpy as np

  # Start at S, finish at F. Between them, the edge of the cliff.
  WALK = [
      "........",
      "........",
      "........",
      "S~~~~~~F",
  ]
  MOVES = [(-1, 0), (1, 0), (0, -1), (0, 1)]   # up, down, left, right
  START, FINISH = (3, 0), (3, 7)


  def step(tile, action):
      """No slipping on the clifftop. Over the edge: -100, and it's back to the start."""
      row = min(max(tile[0] + MOVES[action][0], 0), 3)
      col = min(max(tile[1] + MOVES[action][1], 0), 7)
      if WALK[row][col] == "~":
          return START, -100, False
      return (row, col), -1, (row, col) == FINISH


  def choose(Q, tile, epsilon, rng):
      if rng.random() < epsilon:
          return int(rng.integers(4))
      return int(np.argmax(Q[tile]))


  def learn(method, walks=500, alpha=0.5, epsilon=0.1, seed=3):
      rng = np.random.default_rng(seed)
      Q = np.zeros((4, 8, 4))
      falls = 0
      for walk in range(walks):
          tile = START
          action = choose(Q, tile, epsilon, rng)
          over = False
          while not over:
              after, reward, over = step(tile, action)
              falls += reward == -100
              next_action = choose(Q, after, epsilon, rng)
              if method == "sarsa":
                  ahead = Q[after][next_action]     # what it will actually do next
              else:
                  ahead = Q[after].max()            # the best it could do next
              target = reward + (0 if over else ahead)
              Q[tile][action] += alpha * (target - Q[tile][action])
              tile, action = after, next_action
      return Q, falls


  def route(Q):
      """Follow the best moves from the start and mark the tiles it crosses."""
      rows = [list(line) for line in WALK]
      tile = START
      for _ in range(30):
          tile, _, over = step(tile, int(np.argmax(Q[tile])))
          if over:
              break
          rows[tile[0]][tile[1]] = "*"
      return ["".join(row) for row in rows]


  for method in ["q-learning", "sarsa"]:
      Q, falls = learn(method)
      print(f"{method}: fell in {falls} times while learning")
      print("\n".join(route(Q)))
      print()
tasks:
  - id: edge
    prompt: "Run it. Whose route runs right along the edge of the cliff?"
    kind: answer
    accept: ["q-learning", "q learning", "q", "qlearning", "q-learning's", "the q-learning one"]
    feedback: "Q-learning's. Along the edge is the shortest walk, and Q-learning learns what the best walker would do. The best walker never explores, so never falls."
    wrong: "Look for the row of stars just above the water."
  - id: falls
    prompt: "Which one fell in more often while it was learning?"
    kind: answer
    accept: ["q-learning", "q learning", "q", "qlearning", "the q-learning one"]
    feedback: "Q-learning. It walks the edge while still exploring one move in ten, and a random step down is a fall. SARSA counted its own exploring into its values, so it learned to keep a few tiles between itself and the water."
    wrong: "Read the numbers on the two 'fell in' lines."
  - id: less-exploring
    prompt: "Change `epsilon=0.1` to `epsilon=0.01` in the line that starts `def learn`, and run it again. Does SARSA's route move closer to the edge, or further away?"
    kind: answer
    accept: ["closer", "closer to the edge", "nearer", "nearer the edge", "towards the edge", "closer to it", "it moves closer"]
    feedback: "Closer. Exploring less makes a random step down rarer, so walking near the edge costs SARSA less. As epsilon shrinks towards 0, SARSA's route and Q-learning's become the same."
    wrong: "Compare the row of stars before and after."
---
A path along a clifftop, with the edge along the bottom. Both learners explore one move in ten. Only one line of `learn` differs between them.
