"""The keeper, checked against doing nothing. Run with: pytest"""

import numpy as np
import pytest

from agent import do_nothing, make_agent
from gate_env import MAX_STEPS, TideGateEnv

TEST_TIDES = range(1000, 1020)   # tides the keeper never trained on


def safe_quarter_hours(act, seed):
    env = TideGateEnv()
    observation, _ = env.reset(seed=seed)
    safe = 0.0
    while True:
        observation, reward, terminated, truncated, _ = env.step(act(observation))
        safe += reward
        if terminated or truncated:
            return safe


@pytest.fixture(scope="module")
def keeper():
    return make_agent(seed=0)


def test_doing_nothing_fails():
    average = np.mean([safe_quarter_hours(do_nothing, seed) for seed in TEST_TIDES])
    assert average < 60, "Leaving the gate alone should flood or ground the harbour within a tide or so."


def test_keeper_chooses_real_actions(keeper):
    env = TideGateEnv()
    observation, _ = env.reset(seed=1)
    for _ in range(30):
        action = keeper.act(observation)
        assert env.action_space.contains(action), f"act should return 0, 1 or 2, not {action!r}."
        observation, _, terminated, truncated, _ = env.step(action)
        if terminated or truncated:
            break


def test_keeper_is_reproducible(keeper):
    again = make_agent(seed=0)
    env = TideGateEnv()
    observation, _ = env.reset(seed=2)
    for _ in range(50):
        assert keeper.act(observation) == again.act(observation), "make_agent(seed=0) should train the same keeper every time."
        observation, _, terminated, truncated, _ = env.step(keeper.act(observation))
        if terminated or truncated:
            break


def test_keeper_beats_doing_nothing(keeper):
    keeper_average = np.mean([safe_quarter_hours(keeper.act, seed) for seed in TEST_TIDES])
    baseline = np.mean([safe_quarter_hours(do_nothing, seed) for seed in TEST_TIDES])
    assert keeper_average >= baseline + 50, f"The keeper averages {keeper_average:.1f} safe quarter hours; doing nothing manages {baseline:.1f}."


def test_keeper_keeps_the_harbour_safe(keeper):
    runs = [safe_quarter_hours(keeper.act, seed) for seed in TEST_TIDES]
    assert np.mean(runs) >= 0.75 * MAX_STEPS, f"Over 20 new tides the harbour was safe for {np.mean(runs):.1f} of {MAX_STEPS} quarter hours on average. Aim for 150."
