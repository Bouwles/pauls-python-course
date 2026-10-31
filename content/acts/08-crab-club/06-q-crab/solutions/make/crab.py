# The Q-Learning Crab: the crab learns the League course by racing it, and enters the Arcade League.

import json

import numpy as np
try:
    from workshop import show_grid  # draws in the workshop's output panel
except ImportError:  # anywhere else, drawing does nothing and the rest still runs
    def show_grid(*args, **kwargs):
        pass

from course import COLS, FINISH, MAX_MOVES, ROCKS, ROWS, START, race, random_start, show_policy, step


def choose(Q, tile, epsilon, rng):
    """Epsilon-greedy: any action with chance epsilon, otherwise the best so far."""
    if rng.random() < epsilon:
        return int(rng.integers(4))
    return int(np.argmax(Q[tile]))


def q_update(Q, tile, action, reward, after, over, alpha=0.1, gamma=1.0):
    """One Q-learning update, in place. Returns the TD error."""
    target = reward + (0 if over else gamma * Q[after].max())
    error = target - Q[tile][action]
    Q[tile][action] += alpha * error
    return error


def train(races, rng, alpha=0.1, gamma=1.0, epsilon=0.1):
    """Q-learning from practice races, alternately from the start and from anywhere.

    Returns the Q-table: ROWS by COLS by 4.
    """
    Q = np.zeros((ROWS, COLS, 4))
    for practice in range(races):
        tile = START if practice % 2 == 0 else random_start(rng)
        if practice % 100 == 0:
            show_grid(Q.max(axis=2), policy=Q.argmax(axis=2), q=Q, crab=tile, walls=ROCKS, goal=FINISH,
                      title=f"practice race {practice}")
        for _ in range(MAX_MOVES):
            action = choose(Q, tile, epsilon, rng)
            after, reward, over = step(tile, action, rng)
            q_update(Q, tile, action, reward, after, over, alpha, gamma)
            tile = after
            if over:
                break
    return Q


def greedy_policy(Q):
    """The best action on every tile, as ROWS lists of COLS actions from 0 to 3."""
    return Q.argmax(axis=2).tolist()


def save_entry(Q, path="league.json"):
    """Write the Q-table in the League's format."""
    with open(path, "w") as f:
        json.dump({"format": "ppc-league-1", "q": Q.tolist()}, f)


if __name__ == "__main__":
    rng = np.random.default_rng(7)
    Q = train(3000, rng)
    policy = greedy_policy(Q)
    show_policy(policy)
    moves = [race(policy, np.random.default_rng(seed)) for seed in range(50)]
    finished = sum(1 for m in moves if m < MAX_MOVES)
    print(f"50 races: {np.mean(moves):.2f} moves on average, {finished} finished")
    save_entry(Q)
    print("Saved league.json")
