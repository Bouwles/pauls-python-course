"""CartPole with DQN: the racing grid's Deep Q, taken home to Gymnasium's CartPole-v1.

A cart on a track, a pole hinged on top. Each step, push the cart left (0) or
right (1). The state is four numbers: the cart's position and speed, the pole's
angle and how fast it is turning. Every step the pole stays up earns 1. The
episode is terminated when the pole leans past 12 degrees or the cart leaves
the track, and truncated at 500 steps, when it has been balanced as long as
CartPole asks.

Run it:   python cartpole_dqn.py
"""

import gymnasium as gym
import numpy as np

STATE_SIZE = 4
ACTIONS = 2


# Moss's pieces: the network from the workshop, now any size.
def new_params(rng, inputs=STATE_SIZE, hidden=64, outputs=ACTIONS):
    """Small random weights: the state in, one hidden layer, a Q-value for each action out."""
    return {
        "W1": rng.normal(0, 1 / np.sqrt(inputs), (inputs, hidden)),
        "b1": np.zeros(hidden),
        "W2": rng.normal(0, 1 / np.sqrt(hidden), (hidden, outputs)),
        "b2": np.zeros(outputs),
    }


def q_values(params, X):
    """One row of Q-values for each row of X."""
    hidden = np.maximum(0, X @ params["W1"] + params["b1"])
    return hidden @ params["W2"] + params["b2"]


def gradients(params, X, actions, y):
    """The loss on the actions taken, and its gradient for every weight.

    As in the workshop, but each error's pull is capped at 1 (the Huber loss),
    so one wild target early on can't fling the weights across the room.
    """
    Z1 = X @ params["W1"] + params["b1"]
    H = np.maximum(0, Z1)
    Q = H @ params["W2"] + params["b2"]
    n = len(X)
    rows = np.arange(n)
    error = Q[rows, actions] - y
    loss = np.mean(np.where(np.abs(error) < 1, error ** 2 / 2, np.abs(error) - 0.5))
    dQ = np.zeros_like(Q)
    dQ[rows, actions] = np.clip(error, -1, 1) / n
    dH = dQ @ params["W2"].T
    dZ1 = dH * (Z1 > 0)
    return loss, {"W1": X.T @ dZ1, "b1": dZ1.sum(axis=0), "W2": H.T @ dQ, "b2": dQ.sum(axis=0)}


class Adam:
    """Adam, from the observatory: each weight gets its own step size."""

    def __init__(self, params, rate=1e-3, beta1=0.9, beta2=0.999, eps=1e-8):
        self.rate, self.beta1, self.beta2, self.eps = rate, beta1, beta2, eps
        self.m = {name: np.zeros_like(w) for name, w in params.items()}
        self.v = {name: np.zeros_like(w) for name, w in params.items()}
        self.t = 0

    def step(self, params, grads):
        """Change params in place, one step downhill."""
        self.t += 1
        for name in params:
            self.m[name] = self.beta1 * self.m[name] + (1 - self.beta1) * grads[name]
            self.v[name] = self.beta2 * self.v[name] + (1 - self.beta2) * grads[name] ** 2
            m_hat = self.m[name] / (1 - self.beta1 ** self.t)
            v_hat = self.v[name] / (1 - self.beta2 ** self.t)
            params[name] -= self.rate * m_hat / (np.sqrt(v_hat) + self.eps)


def copy_params(params):
    """A frozen copy: new arrays, so training params leaves it alone."""
    return {name: weights.copy() for name, weights in params.items()}


def epsilon_at(step, decay=10_000, final=0.05):
    """1.0 at the first step, falling in a straight line to final at step decay, then final."""
    if step >= decay:
        return final
    return 1.0 - (1.0 - final) * step / decay


# Yours: the parts that change when the world does.
class ReplayBuffer:
    """The last capacity steps, kept in arrays. Past capacity, the oldest is overwritten."""

    def __init__(self, capacity, state_size=STATE_SIZE):
        self.capacity = capacity
        self.states = np.zeros((capacity, state_size))
        self.actions = np.zeros(capacity, dtype=int)
        self.rewards = np.zeros(capacity)
        self.next_states = np.zeros((capacity, state_size))
        self.terminated = np.zeros(capacity)
        self.size = 0
        self.slot = 0

    def __len__(self):
        """How many memories are kept."""

    def add(self, state, action, reward, next_state, terminated):
        """Keep one step in the next slot round the ring, overwriting the oldest once full."""
        # Remember every step

    def sample(self, size, rng):
        """size memories picked at random, with replacement: (states, actions, rewards, next_states, terminated)."""
        # Pick a batch at random, not in order


def targets(target_params, rewards, next_states, terminated, gamma=0.99):
    """What each step should have been worth, by the frozen copy's reckoning.

    A terminated step has nothing after it. A truncated one does, so it isn't
    passed in as terminated, and its next state still counts.
    """


def greedy(params, state):
    """The action with the biggest Q-value in this state."""


def act(params, state, epsilon, rng):
    """Epsilon-greedy: any action with chance epsilon, otherwise the greedy one."""


def evaluate(env, choose, episodes=20, seed=1000):
    """The average score over episodes, asking choose(state) for every action.

    The first episode is reset with seed, the next with seed + 1, and so on,
    so two policies can be judged on exactly the same starts.
    """


def train(env, steps, rng, seed=0, batch_size=64, sync_every=500, start=1000, check_every=2500,
          gamma=0.99, rate=1e-3, capacity=50_000, decay=10_000):
    """DQN for steps steps. Returns the best params seen, by a short check every check_every steps.

    The first reset uses seed. Training starts once start steps are remembered.
    The check is evaluate() on five episodes from seed 500, which training never
    sees, with the greedy action; keep a copy of the params whenever it does at
    least as well as the best so far.
    """
    # Set up: params, a frozen copy, Adam, the memory, and a gym.make("CartPole-v1") to check on
    # Each step: act, step the env, remember, reset when the episode ends
    # Once there's enough memory: a batch at random, targets from the frozen copy, one Adam step
    # Refresh the frozen copy now and then
    # Keep the best network seen


if __name__ == "__main__":
    env = gym.make("CartPole-v1")
    rng = np.random.default_rng(0)
    print(f"Pushing at random: {evaluate(env, lambda state: int(rng.integers(ACTIONS))):.1f} steps, on average")
    params = train(env, 100_000, rng)
    print(f"The network: {evaluate(env, lambda state: greedy(params, state)):.1f} steps of 500, on average")
