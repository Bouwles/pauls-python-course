"""Your own tests. The agreed ones are Gwen's; these are for whatever you
know might break. One to start you off.
"""
from pier import BUCKET_WIDTH, ITEM_SIZE, WIDTH, Game


def drop_and_wait(game, kind, x, frames=300):
    game.drop(kind, x)
    for _ in range(frames):
        if not game.state()["items"]:
            return
        game.update()


def test_a_new_game_has_nothing_falling():
    assert Game(spawn=False).state()["items"] == []


def test_a_boot_and_a_mackerel_landing_together():
    game = Game(spawn=False)
    x = game.state()["bucket_x"]
    game.drop("mackerel", x)
    game.drop("boot", x + ITEM_SIZE)
    for _ in range(300):
        game.update()
    assert (game.state()["score"], game.state()["lives"]) == (1, 2)


def test_the_tenth_mackerel_and_the_last_life_in_one_frame():
    game = Game(spawn=False)
    for _ in range(9):
        drop_and_wait(game, "mackerel", game.state()["bucket_x"])
    for _ in range(2):
        drop_and_wait(game, "boot", game.state()["bucket_x"])
    x = game.state()["bucket_x"]
    game.drop("mackerel", x)
    game.drop("boot", x + ITEM_SIZE)
    for _ in range(300):
        game.update()
    state = game.state()
    assert (state["score"], state["lives"], state["over"]) == (10, 0, True)


def test_a_catch_at_the_far_right_end():
    game = Game(spawn=False)
    for _ in range(100):
        game.move(1)
    drop_and_wait(game, "mackerel", WIDTH - ITEM_SIZE)
    assert game.state()["score"] == 1


def test_moving_while_over_does_nothing():
    game = Game(spawn=False)
    for _ in range(3):
        drop_and_wait(game, "boot", game.state()["bucket_x"])
    before = game.state()["bucket_x"]
    game.move(-1)
    assert game.state()["bucket_x"] == before == (WIDTH - BUCKET_WIDTH) // 2
