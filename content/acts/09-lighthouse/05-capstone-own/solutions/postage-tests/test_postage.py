"""Your tests for the postage on Riya's prints. Write them from the docstring in
postage.py, as if you couldn't see the code underneath it.

Plain test functions with no arguments. To check for an error:
    with pytest.raises(ValueError):
        postage(0, "local")
"""
import pytest

from postage import postage


def test_a_small_local_print():
    assert postage(20, "local") == 60


def test_each_band_at_its_top_weight():
    assert postage(100, "local") == 60
    assert postage(500, "local") == 90
    assert postage(2000, "local") == 150


def test_each_band_just_past_the_last():
    assert postage(101, "local") == 90
    assert postage(501, "local") == 150


def test_away_is_twice_local():
    for weight in (1, 100, 101, 500, 501, 2000):
        assert postage(weight, "away") == 2 * postage(weight, "local")


def test_the_lightest_parcel():
    assert postage(1, "local") == 60


def test_nothing_weighs_nothing():
    for weight in (0, -5):
        with pytest.raises(ValueError):
            postage(weight, "local")


def test_too_heavy_to_post():
    with pytest.raises(ValueError):
        postage(2001, "away")


def test_nowhere_else():
    with pytest.raises(ValueError):
        postage(50, "abroad")


if __name__ == "__main__":
    pytest.main(["-q", "--capture=sys", "-p", "no:cacheprovider", "test_postage.py"])
