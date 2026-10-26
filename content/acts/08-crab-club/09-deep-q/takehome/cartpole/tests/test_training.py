"""Training on the real CartPole-v1. The second test trains for 100,000 steps: give it a minute."""

import gymnasium as gym
import numpy as np

from cartpole_dqn import evaluate, greedy, train


def test_training_is_repeatable():
    first = train(gym.make("CartPole-v1"), 3000, np.random.default_rng(5), seed=5, start=500, check_every=1000)
    second = train(gym.make("CartPole-v1"), 3000, np.random.default_rng(5), seed=5, start=500, check_every=1000)
    assert set(first) == {"W1", "b1", "W2", "b2"}
    assert all(np.array_equal(first[name], second[name]) for name in first), "The same seeds should train the same network."


def test_it_balances_the_pole():
    env = gym.make("CartPole-v1")
    params = train(env, 100_000, np.random.default_rng(0))
    score = evaluate(env, lambda state: greedy(params, state), episodes=20, seed=1000)
    assert score >= 195, f"Balanced for {score:.1f} steps on average: it should manage at least 195 of 500."
