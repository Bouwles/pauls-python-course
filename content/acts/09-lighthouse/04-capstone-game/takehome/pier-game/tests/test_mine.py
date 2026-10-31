"""Your own tests. The agreed ones are Caitlin's; these are for whatever you
know might break. One to start you off.
"""
from pier import Game


def test_a_new_game_has_nothing_falling():
    assert Game(spawn=False).state()["items"] == []
