# Sir Reginald, the championship crab.
#
# Q-learning on whatever course the stewards lay out, from practice alone.
# Practice moves are scarce, so every move is remembered and replayed:
# each real move pays for ten more learning steps from memory. Exploring
# and the step size both start large and shrink, so the values settle and
# no two tiles end up pointing at each other. Every tile starts out worth
# minus its distance to the finish as the gull flies: a guess, and a
# hopeful one, so he goes and looks.

import numpy as np

from course import MAX_MOVES, OutOfPractice, STEPS


# Lady Agatha raced the club's course every Sunday for three years and never
# lost. The first Sunday they moved the rocks, she sat down on the start line
# and would not race. The machine on the hill has only ever known one town. A.P.
def hopeful_guess(practice):
    """Q for every tile and move: minus the moves to the finish as the gull flies, after this one."""
    q = np.zeros((practice.rows, practice.cols, 4))
    for row in range(practice.rows):
        for col in range(practice.cols):
            for action, (d_row, d_col) in enumerate(STEPS):
                after_row = min(max(row + d_row, 0), practice.rows - 1)
                after_col = min(max(col + d_col, 0), practice.cols - 1)
                gull = abs(after_row - practice.finish[0]) + abs(after_col - practice.finish[1])
                q[row, col, action] = -1 - gull
    return q


def train(practice, rng, replay=10, gamma=0.99):
    """Practise until the stewards say stop. Returns a policy: rows of actions, 0 to 3."""
    q = hopeful_guess(practice)
    memory = []
    races = 0
    try:
        while True:
            races += 1
            epsilon = max(0.05, 0.97 ** races)
            rate = max(0.05, 0.5 * 0.98 ** races)
            tile = practice.reset()
            for _ in range(MAX_MOVES):
                if rng.random() < epsilon:
                    action = int(rng.integers(4))
                else:
                    action = int(np.argmax(q[tile]))
                after, reward, over = practice.step(action)
                memory.append((tile, action, reward, after, over))
                for i in [len(memory) - 1] + list(rng.integers(len(memory), size=replay)):
                    was, did, got, now, done = memory[i]
                    target = got + (0 if done else gamma * q[now].max())
                    q[was][did] += rate * (target - q[was][did])
                tile = after
                if over:
                    break
    except OutOfPractice:
        pass
    return q.argmax(axis=2).tolist()
