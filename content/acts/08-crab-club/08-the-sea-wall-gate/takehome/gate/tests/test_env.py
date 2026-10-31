"""The gate, checked against Caitlin's rules. Run with: pytest"""

import numpy as np
import pytest
from gymnasium import spaces
from gymnasium.utils.env_checker import check_env

from gate_env import FLOOD, FLOW, GROUND, MAX_STEPS, NOTCHES, RIVER, TideGateEnv


def careful_keeper(observation):
    """Paul's rule of thumb: let water through only when it moves the harbour towards 3 metres."""
    harbour, sea, gate, _ = (float(x) for x in observation)
    wanted = NOTCHES if (harbour > 3.0 and sea < harbour) or (harbour < 3.0 and sea > harbour) else 0
    return 2 if gate < wanted else (0 if gate > wanted else 1)


def run(env, choose, seed, limit=1000):
    """Reset with seed, then step until the episode ends. Every (observation, reward, terminated, truncated)."""
    observation, _ = env.reset(seed=seed)
    history = [(observation, None, False, False)]
    for _ in range(limit):
        observation, reward, terminated, truncated, _ = env.step(choose(observation))
        history.append((observation, reward, terminated, truncated))
        if terminated or truncated:
            break
    return history


def test_action_space():
    env = TideGateEnv()
    assert env.action_space == spaces.Discrete(3), "Three actions: 0 wind down, 1 leave it, 2 wind up."


def test_observation_space():
    env = TideGateEnv()
    assert isinstance(env.observation_space, spaces.Box), "The observation is four numbers: a Box."
    assert env.observation_space.shape == (4,)
    assert env.observation_space.dtype == np.float32


def test_reset_gives_observation_and_info():
    env = TideGateEnv()
    result = env.reset(seed=1)
    assert isinstance(result, tuple) and len(result) == 2, "reset returns (observation, info)."
    observation, info = result
    assert isinstance(info, dict)
    assert env.observation_space.contains(observation), f"{observation!r} isn't inside observation_space."
    harbour, sea, gate, rise = observation
    assert 2.8 <= harbour <= 3.2, "The harbour starts within 0.2 m of 3 m."
    assert gate == 2, "The gate starts at notch 2."
    assert rise == 0, "Nothing has risen yet at the start."


def test_step_gives_five_things():
    env = TideGateEnv()
    env.reset(seed=2)
    result = env.step(1)
    assert isinstance(result, tuple) and len(result) == 5, "step returns (observation, reward, terminated, truncated, info)."
    observation, reward, terminated, truncated, info = result
    assert env.observation_space.contains(observation)
    assert isinstance(reward, float)
    assert isinstance(terminated, bool) and isinstance(truncated, bool), "terminated and truncated are True or False."
    assert isinstance(info, dict)


def test_gymnasium_is_satisfied():
    check_env(TideGateEnv(), skip_render_check=True)


def test_same_seed_same_tides():
    actions = [2, 2, 1, 0, 0, 1, 2, 1, 1, 0] * 3
    first, second = TideGateEnv(), TideGateEnv()
    a, _ = first.reset(seed=7)
    b, _ = second.reset(seed=7)
    assert np.array_equal(a, b)
    for action in actions:
        a, ra, ta, ua, _ = first.step(action)
        b, rb, tb, ub, _ = second.step(action)
        assert np.array_equal(a, b) and (ra, ta, ua) == (rb, tb, ub), "With the same seed and actions, every step should match."
        if ta or ua:
            break


def test_different_seeds_different_tides():
    env = TideGateEnv()
    seas = {round(float(env.reset(seed=seed)[0][1]), 4) for seed in range(10)}
    assert len(seas) > 5, "Different seeds should give different tides. Draw from self.np_random, which reset seeds."


def test_gate_moves_a_notch_at_a_time():
    env = TideGateEnv()
    for seed in range(3, 23):
        env.reset(seed=seed)
        seen = []
        for action in [2, 2, 2, 0, 0, 0, 0, 0, 1]:
            observation, _, terminated, truncated, _ = env.step(action)
            seen.append(int(observation[2]))
            if terminated or truncated:
                break
        else:
            assert seen == [3, 4, 4, 3, 2, 1, 0, 0, 0], "Up and down one notch per step, never past 0 or 4."
            return
    raise AssertionError("Every tide from seed 3 to 22 ended within 9 steps. The harbour shouldn't flood that fast.")


def test_harbour_follows_the_rules():
    env = TideGateEnv()
    observation, _ = env.reset(seed=4)
    for action in [1, 2, 2, 0, 1, 0, 0, 2, 1, 1]:
        harbour, sea, gate, _ = (float(x) for x in observation)
        observation, _, terminated, _, _ = env.step(action)
        new_gate = min(max(gate + action - 1, 0), NOTCHES)
        expected = harbour + RIVER + FLOW * new_gate * (sea - harbour)
        assert observation[0] == pytest.approx(expected, abs=1e-4), \
            "The harbour gains the river, plus FLOW times the open notches times (sea minus harbour), using the sea before the step."
        if terminated:
            break


def test_rise_is_the_change_in_the_sea():
    history = run(TideGateEnv(), careful_keeper, seed=5, limit=20)
    for (before, *_), (after, *_) in zip(history, history[1:]):
        assert after[3] == pytest.approx(after[1] - before[1], abs=1e-4)


def test_the_tide_comes_and_goes():
    history = run(TideGateEnv(), careful_keeper, seed=6, limit=50)
    seas = [float(observation[1]) for observation, *_ in history]
    assert len(seas) == 51, "Paul's careful keeper should last 50 steps."
    assert max(seas) - min(seas) >= 2.0, "Over one tide, the sea rises and falls by at least 2 m."
    assert 0.5 <= min(seas) and max(seas) <= 5.5


def test_safe_quarter_hours_are_worth_one():
    for observation, reward, terminated, truncated in run(TideGateEnv(), careful_keeper, seed=8)[1:]:
        if GROUND <= observation[0] <= FLOOD:
            assert reward == 1.0 and not terminated
        else:
            assert reward == 0.0 and terminated


def test_a_shut_gate_floods_the_harbour():
    history = run(TideGateEnv(), lambda observation: 0, seed=9)
    final, reward, terminated, truncated = history[-1]
    assert terminated and not truncated, "With the gate shut, the river fills the harbour until the quay floods."
    assert final[0] > FLOOD and reward == 0.0
    assert len(history) <= 60


def test_wide_open_floods_or_grounds():
    endings = []
    for seed in range(20):
        final, _, terminated, _ = run(TideGateEnv(), lambda observation: 2, seed=seed)[-1]
        assert terminated, "Wide open, the harbour follows the sea out of the safe range."
        endings.append(float(final[0]))
    assert any(level < GROUND for level in endings), "Some tides should leave the boats aground."
    assert any(level > FLOOD for level in endings), "Some tides should flood the quay."


def test_truncated_after_fifty_hours():
    history = run(TideGateEnv(), careful_keeper, seed=10)
    assert len(history) == MAX_STEPS + 1, "Paul's careful keeper keeps the harbour safe for all 200 steps."
    final, reward, terminated, truncated = history[-1]
    assert truncated and not terminated, "At MAX_STEPS the episode is truncated: stopped, not failed."
    assert not any(t for _, _, t, u in history[1:-1]) and not any(u for _, _, t, u in history[1:-1])
