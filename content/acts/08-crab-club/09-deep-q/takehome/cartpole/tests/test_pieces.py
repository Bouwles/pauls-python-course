"""The pieces, one at a time, with no training. Run with: pytest"""

import numpy as np

from cartpole_dqn import ReplayBuffer, act, evaluate, greedy, targets


def remember(buffer, count):
    """Add count steps whose numbers say which step they were: step i has state [i, i, i, i]."""
    for i in range(count):
        buffer.add(np.full(4, float(i)), i % 2, float(i), np.full(4, i + 0.5), i % 3 == 0)


def fixed_params(left, right):
    """A network whose Q-values are left and right in every state."""
    return {"W1": np.zeros((4, 8)), "b1": np.zeros(8), "W2": np.zeros((8, 2)), "b2": np.array([left, right])}


def test_the_buffer_counts():
    buffer = ReplayBuffer(10)
    assert len(buffer) == 0
    remember(buffer, 3)
    assert len(buffer) == 3


def test_the_buffer_forgets_the_oldest():
    buffer = ReplayBuffer(3)
    remember(buffer, 5)
    assert len(buffer) == 3
    states, *_ = buffer.sample(300, np.random.default_rng(1))
    assert set(states[:, 0]) == {2.0, 3.0, 4.0}, "Past capacity, the oldest steps go and the newest stay."


def test_a_batch_has_five_arrays_of_the_right_shapes():
    buffer = ReplayBuffer(100)
    remember(buffer, 20)
    states, actions, rewards, next_states, terminated = buffer.sample(64, np.random.default_rng(2))
    assert states.shape == (64, 4) and next_states.shape == (64, 4)
    assert actions.shape == (64,) and rewards.shape == (64,) and terminated.shape == (64,)


def test_a_batch_keeps_each_step_together():
    buffer = ReplayBuffer(100)
    remember(buffer, 20)
    states, actions, rewards, next_states, terminated = buffer.sample(64, np.random.default_rng(3))
    steps = states[:, 0].astype(int)
    assert np.all(actions == steps % 2)
    assert np.all(rewards == steps)
    assert np.all(next_states[:, 0] == steps + 0.5)
    assert np.all(terminated == (steps % 3 == 0))


def test_a_batch_is_picked_at_random_from_every_memory():
    buffer = ReplayBuffer(100)
    remember(buffer, 10)
    states, *_ = buffer.sample(1000, np.random.default_rng(4))
    assert set(states[:, 0]) == set(float(i) for i in range(10)), "Every memory should get picked sometimes."
    first, *_ = buffer.sample(32, np.random.default_rng(5))
    second, *_ = buffer.sample(32, np.random.default_rng(6))
    assert not np.array_equal(first, second), "Different generators should pick different batches."


def test_targets_look_ahead_unless_the_pole_fell():
    got = targets(fixed_params(1.0, 3.0), np.array([1.0, 1.0]), np.zeros((2, 4)), np.array([0.0, 1.0]))
    assert np.allclose(got, [1.0 + 0.99 * 3.0, 1.0])


def test_targets_use_gamma():
    got = targets(fixed_params(2.0, -1.0), np.array([0.5]), np.zeros((1, 4)), np.array([0.0]), gamma=0.5)
    assert np.allclose(got, [0.5 + 0.5 * 2.0])


def test_greedy_takes_the_biggest_q_value():
    assert greedy(fixed_params(0.0, 1.0), np.zeros(4)) == 1
    assert greedy(fixed_params(2.0, -1.0), np.array([0.1, -0.2, 0.03, 0.4])) == 0


def test_act_explores_with_chance_epsilon():
    rng = np.random.default_rng(7)
    params = fixed_params(0.0, 1.0)
    always = [act(params, np.zeros(4), 0.0, rng) for _ in range(100)]
    assert always == [1] * 100, "With epsilon 0, always the greedy action."
    sometimes = [act(params, np.zeros(4), 1.0, rng) for _ in range(2000)]
    assert 0.45 < sometimes.count(0) / 2000 < 0.55, "With epsilon 1, each action about half the time."


class Countdown:
    """A pretend environment: episode seed lasts seed % 5 + 1 steps, scoring 1 each, whatever the actions."""

    def reset(self, seed=None):
        self.left = seed % 5 + 1
        return np.zeros(4), {}

    def step(self, action):
        self.left -= 1
        return np.zeros(4), 1.0, self.left == 0, False, {}


class Clock:
    """A pretend environment that never falls over and is truncated after 7 steps, scoring the action each step."""

    def reset(self, seed=None):
        self.steps = 0
        return np.zeros(4), {}

    def step(self, action):
        self.steps += 1
        return np.zeros(4), float(action), False, self.steps == 7, {}


def test_evaluate_averages_the_episodes():
    assert evaluate(Countdown(), lambda state: 0, episodes=5, seed=0) == 3.0
    assert evaluate(Countdown(), lambda state: 0, episodes=2, seed=3) == 4.5


def test_evaluate_stops_when_truncated_and_asks_choose():
    assert evaluate(Clock(), lambda state: 1, episodes=3) == 7.0
    assert evaluate(Clock(), lambda state: 0, episodes=3) == 0.0
