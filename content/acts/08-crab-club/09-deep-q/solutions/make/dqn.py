# Deep Q: the crab's Q-values from a small network instead of a table.

import numpy as np

from track import ACTIONS, RACING, START, TRACK, average_return, draw, show_policy, step

ROWS, COLS = len(TRACK), len(TRACK[0])


def features(tile):
    """Seven numbers for a tile: which of the three rows, then which of the four columns."""
    x = np.zeros(ROWS + COLS)
    x[tile[0]] = 1.0
    x[ROWS + tile[1]] = 1.0
    return x


def new_params(rng, hidden=16):
    """Small random weights: seven features in, a hidden layer, four Q-values out."""
    inputs = ROWS + COLS
    return {
        "W1": rng.normal(0, 1 / np.sqrt(inputs), (inputs, hidden)),
        "b1": np.zeros(hidden),
        "W2": rng.normal(0, 1 / np.sqrt(hidden), (hidden, 4)),
        "b2": np.zeros(4),
    }


def q_values(params, X):
    """The network: one row of four Q-values (up, down, left, right) for each row of X."""
    hidden = np.maximum(0, X @ params["W1"] + params["b1"])
    return hidden @ params["W2"] + params["b2"]


def gradients(params, X, actions, y):
    """Riya's, fixed. The loss, the mean squared TD error on the moves taken,
    and its gradient for every weight. Only the moves taken are to blame."""
    Z1 = X @ params["W1"] + params["b1"]
    H = np.maximum(0, Z1)
    Q = H @ params["W2"] + params["b2"]
    n = len(X)
    rows = np.arange(n)
    chosen = Q[rows, actions]
    loss = np.mean((chosen - y) ** 2)
    dQ = np.zeros_like(Q)
    dQ[rows, actions] = 2 * (chosen - y) / n
    dH = dQ @ params["W2"].T
    dZ1 = dH * (Z1 > 0)
    return loss, {"W1": X.T @ dZ1, "b1": dZ1.sum(axis=0), "W2": H.T @ dQ, "b2": dQ.sum(axis=0)}


class ReplayBuffer:
    """The crab's memories of single moves, the oldest forgotten first."""

    def __init__(self, capacity):
        self.capacity = capacity
        self.memories = []

    def __len__(self):
        return len(self.memories)

    def add(self, tile, action, reward, after, over):
        # Remember every move
        self.memories.append((tile, action, reward, after, over))
        if len(self.memories) > self.capacity:
            self.memories.pop(0)

    def sample(self, size, rng):
        # Pick a batch at random, not in order
        picks = rng.choice(len(self.memories), size=size, replace=False)
        return [self.memories[i] for i in picks]


def targets(target_params, rewards, X_after, overs, gamma=0.9):
    """What each move should have been worth, by the frozen copy's reckoning."""
    best_after = q_values(target_params, X_after).max(axis=1)
    return rewards + gamma * best_after * (1 - overs)


def train_step(params, target_params, batch, gamma=0.9, rate=0.05):
    """One step of gradient descent on a batch of memories. Returns the loss before the step."""
    X = np.array([features(tile) for tile, _, _, _, _ in batch])
    actions = np.array([action for _, action, _, _, _ in batch])
    rewards = np.array([reward for _, _, reward, _, _ in batch], dtype=float)
    X_after = np.array([features(after) for _, _, _, after, _ in batch])
    overs = np.array([over for _, _, _, _, over in batch], dtype=float)
    # Work out the targets with the frozen copy
    y = targets(target_params, rewards, X_after, overs, gamma)
    # Nudge the guesses for the moves taken
    loss, grads = gradients(params, X, actions, y)
    for name in params:
        params[name] -= rate * grads[name]
    return loss


def epsilon_at(episode, decay=100):
    """Explore less as it learns: 1.0 at the first race, down to 0.05 at race decay, then 0.05."""
    if episode >= decay:
        return 0.05
    return 1.0 - 0.95 * episode / decay


def copy_params(params):
    """A frozen copy: new arrays, so training params leaves it alone."""
    return {name: weights.copy() for name, weights in params.items()}


def greedy(params):
    """The move with the biggest Q-value on every tile still racing."""
    q = q_values(params, np.array([features(tile) for tile in RACING]))
    return {tile: ACTIONS[int(np.argmax(row))] for tile, row in zip(RACING, q)}


def train(episodes, rng, batch_size=32, sync_every=50, capacity=2000, gamma=0.9, rate=0.05, watch=False):
    """Deep Q on the racing grid. Returns the trained params."""
    params = new_params(rng)
    target_params = copy_params(params)
    memory = ReplayBuffer(capacity)
    moves = 0
    for episode in range(episodes):
        epsilon = epsilon_at(episode)
        tile = START
        for _ in range(100):
            if rng.random() < epsilon:
                action = int(rng.integers(4))
            else:
                action = int(np.argmax(q_values(params, features(tile)[None])[0]))
            after, reward, over = step(tile, ACTIONS[action], rng)
            memory.add(tile, action, reward, after, over)
            moves += 1
            if len(memory) >= batch_size:
                train_step(params, target_params, memory.sample(batch_size, rng), gamma, rate)
            # Refresh the frozen copy now and then
            if moves % sync_every == 0:
                target_params = copy_params(params)
            tile = after
            if over:
                break
        if watch:
            q = q_values(params, np.array([features(t) for t in RACING]))
            draw({t: row.max() for t, row in zip(RACING, q)}, greedy(params),
                 q={t: row for t, row in zip(RACING, q)}, title=f"race {episode + 1}")
    return params


if __name__ == "__main__":
    rng = np.random.default_rng(7)
    params = train(150, rng, watch=True)
    line = greedy(params)
    print("The network's line")
    show_policy(line)
    print(f"Average return over 1000 races: {average_return(lambda tile: line[tile], rng):.2f}")
    print(f"At random: {average_return(lambda tile: ACTIONS[int(rng.integers(4))], rng):.2f}")
