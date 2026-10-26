"""Your own tests for descent.py and reproduce.py. reproduce.py runs them with pytest.

Two to start you off. Add yours, from your test plan: the shapes, the seeds,
and anything the figure depends on.
"""
import numpy as np

from descent import relu_features
from reproduce import run_once


def test_features_are_never_negative():
    rng = np.random.default_rng(0)
    features = relu_features(rng.normal(size=(5, 3)), rng.normal(size=(3, 8)))
    assert (features >= 0).all()


def test_same_seed_same_errors():
    assert run_once(15, seed=1) == run_once(15, seed=1)
