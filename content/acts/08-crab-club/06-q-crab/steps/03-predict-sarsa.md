---
id: predict-sarsa
type: predict
title: What he will actually do
concept: sarsa
code: |
  next_q = {"up": 5.0, "down": 3.0, "left": 4.0, "right": 9.0}   # Q on (0, 2)
  alpha, gamma = 0.5, 0.9

  # On (1, 2) he was told up, got -1, and landed on (0, 2).
  # There, epsilon-greedy has just picked his next move: it explored, and picked left.
  next_action = "left"

  q_learning = 0.0 + alpha * (-1 + gamma * max(next_q.values()) - 0.0)
  sarsa = 0.0 + alpha * (-1 + gamma * next_q[next_action] - 0.0)
  print(f"Q-learning: {q_learning:.2f}")
  print(f"SARSA: {sarsa:.2f}")
question: "The same step, learned two ways. What does this print?"
options:
  - text: |-
      Q-learning: 3.55
      SARSA: 1.30
    correct: true
    feedback: "Right. Q-learning's target uses the best move on (0, 2), 9.0, whatever he does next. SARSA's uses the move he's actually about to make, left, worth 4.0. SARSA learns what his real, exploring behaviour is worth."
  - text: |-
      Q-learning: 3.55
      SARSA: 3.55
    misconception: sarsa-uses-max
    feedback: "SARSA doesn't take the best next move. It waits until the next move has been chosen, exploring or not, and uses that move's Q-value."
  - text: |-
      Q-learning: 1.30
      SARSA: 3.55
    misconception: q-learning-on-policy
    feedback: "That's the two swapped. Q-learning is the one that assumes the best next move. SARSA follows what he actually does."
---
**SARSA** is Q-learning's careful cousin. The name is the five things one update needs: **S**tate, **A**ction, **R**eward, the next **S**tate, and the next **A**ction he has already chosen there.

Q-learning learns what moves are worth if he plays his best afterwards. SARSA learns what they're worth if he carries on as he is, exploring one time in ten.
