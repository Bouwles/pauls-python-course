"""Your own tests for descent.py and reproduce.py. reproduce.py runs them with pytest.

Two to start you off. Add yours, from your test plan: the shapes, the seeds,
and anything the figure depends on.
"""
import numpy as np

from descent import fit_min_norm, relu_features
from reproduce import descent_curve, run_once


def test_features_are_never_negative():
    rng = np.random.default_rng(0)
    features = relu_features(rng.normal(size=(5, 3)), rng.normal(size=(3, 8)))
    assert (features >= 0).all()


def test_same_seed_same_errors():
    assert run_once(15, seed=1) == run_once(15, seed=1)


def test_different_seeds_differ():
    assert run_once(15, seed=1) != run_once(15, seed=2)


def test_one_weight_per_feature():
    rng = np.random.default_rng(3)
    assert fit_min_norm(rng.normal(size=(4, 9)), rng.normal(size=4)).shape == (9,)


def test_past_the_threshold_training_error_is_zero():
    train_error, _ = run_once(200, seed=4)
    assert train_error < 1e-12


def test_below_the_threshold_training_error_is_not():
    train_error, _ = run_once(10, seed=4)
    assert train_error > 0.01


def test_the_peak_is_at_forty():
    low, peak, high = descent_curve([20, 40, 80], seeds=range(5))
    assert peak > 5 * low and peak > 5 * high
