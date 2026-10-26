"""Your tests for Mira's postage. Write them from the docstring in
postage.py, as if you couldn't see the code underneath it.

Plain test functions with no arguments. To check for an error:
    with pytest.raises(ValueError):
        postage(0, "local")
"""
import pytest

from postage import postage


def test_a_letter_in_{{town_id}}():
    assert postage(20, "local") == 60


if __name__ == "__main__":
    pytest.main(["-q", "--capture=sys", "-p", "no:cacheprovider", "test_postage.py"])
