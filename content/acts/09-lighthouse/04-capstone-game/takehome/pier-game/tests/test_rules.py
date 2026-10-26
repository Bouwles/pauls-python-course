"""Gwen's rules, as tests. Leave these as they are: they're the agreement.
Your own tests go in test_mine.py.
"""
import pytest

from pier import BUCKET_SPEED, BUCKET_WIDTH, BUCKET_Y, HEIGHT, ITEM_SIZE, WIDTH, Game


def quiet_game():
    """A game where nothing falls unless the test drops it."""
    return Game(spawn=False)


def fall(game, frames=300):
    """Let the game run until nothing is falling, or the frames run out."""
    for _ in range(frames):
        if not game.state()["items"]:
            return
        game.update()


def catch(game, kind):
    """Drop something straight over the bucket and let it land."""
    game.drop(kind, game.state()["bucket_x"])
    fall(game)


def tally(game):
    """Score, lives, and how many things are still falling."""
    state = game.state()
    return state["score"], state["lives"], len(state["items"])


def test_a_new_game():
    game = quiet_game()
    assert game.state() == {"bucket_x": (WIDTH - BUCKET_WIDTH) // 2, "items": [], "score": 0, "lives": 3, "level": 1, "over": False}


def test_the_bucket_moves_both_ways():
    game = quiet_game()
    start = game.state()["bucket_x"]
    game.move(1)
    assert game.state()["bucket_x"] == start + BUCKET_SPEED
    game.move(-1)
    game.move(-1)
    assert game.state()["bucket_x"] == start - BUCKET_SPEED
    game.move(0)
    assert game.state()["bucket_x"] == start - BUCKET_SPEED


def test_the_bucket_stays_on_the_pier():
    game = quiet_game()
    for _ in range(100):
        game.move(-1)
    assert game.state()["bucket_x"] == 0
    for _ in range(100):
        game.move(1)
    assert game.state()["bucket_x"] == WIDTH - BUCKET_WIDTH


def test_things_fall_at_the_levels_speed():
    game = quiet_game()
    game.drop("mackerel", 40)
    assert game.state()["items"] == [{"kind": "mackerel", "x": 40, "y": 0}]
    game.update()
    game.update()
    assert game.state()["items"] == [{"kind": "mackerel", "x": 40, "y": 2 * game.fall_speed()}]
    assert game.fall_speed() == 4


def test_only_mackerel_and_boots_fall():
    with pytest.raises(ValueError):
        quiet_game().drop("gull", 40)


def test_a_mackerel_in_the_bucket_scores():
    game = quiet_game()
    catch(game, "mackerel")
    assert tally(game) == (1, 3, 0)


def test_a_boot_in_the_bucket_costs_a_life():
    game = quiet_game()
    catch(game, "boot")
    assert tally(game) == (0, 2, 0)


def test_a_miss_costs_nothing():
    game = quiet_game()
    game.drop("mackerel", 0)
    game.drop("boot", WIDTH - ITEM_SIZE)
    fall(game)
    assert tally(game) == (0, 3, 0)


def test_nothing_is_caught_before_it_reaches_the_bucket():
    game = quiet_game()
    game.drop("mackerel", game.state()["bucket_x"])
    while game.state()["items"] and game.state()["items"][0]["y"] + ITEM_SIZE + game.fall_speed() <= BUCKET_Y:
        game.update()
        assert game.state()["score"] == 0
    assert game.state()["items"], "The mackerel vanished before it reached the bucket."


def test_touching_the_edge_is_not_a_catch():
    game = quiet_game()
    bucket_x = game.state()["bucket_x"]
    game.drop("mackerel", bucket_x + BUCKET_WIDTH)
    game.drop("mackerel", bucket_x - ITEM_SIZE)
    fall(game)
    assert game.state()["score"] == 0


def test_a_corner_over_the_bucket_is_a_catch():
    game = quiet_game()
    game.drop("mackerel", game.state()["bucket_x"] + BUCKET_WIDTH - 1)
    fall(game)
    assert game.state()["score"] == 1


def test_ten_mackerel_make_level_two():
    game = quiet_game()
    for _ in range(9):
        catch(game, "mackerel")
    assert game.state()["level"] == 1
    catch(game, "mackerel")
    assert (game.state()["level"], game.fall_speed()) == (2, 5)


def test_the_levels_stop_at_nine():
    game = quiet_game()
    for _ in range(95):
        catch(game, "mackerel")
    assert game.state()["level"] == 9


def test_three_boots_and_the_game_is_over():
    game = quiet_game()
    for _ in range(3):
        catch(game, "boot")
    assert (game.state()["lives"], game.state()["over"]) == (0, True)


def test_nothing_changes_after_the_game_is_over():
    game = quiet_game()
    for _ in range(3):
        catch(game, "boot")
    before = game.state()
    game.move(1)
    game.drop("mackerel", 40)
    game.update()
    assert game.state() == before


def test_things_fall_by_themselves():
    game = Game(seed=1)
    seen = set()
    for _ in range(600):
        game.update()
        seen.update(item["kind"] for item in game.state()["items"])
        assert all(0 <= item["x"] <= WIDTH - ITEM_SIZE and item["y"] <= HEIGHT for item in game.state()["items"])
    assert seen == {"mackerel", "boot"}


def test_the_same_seed_plays_the_same_game():
    games = Game(seed=7), Game(seed=7)
    histories = [], []
    for frame in range(500):
        for game, history in zip(games, histories):
            game.move((frame // 40) % 3 - 1)
            game.update()
            history.append(game.state())
    assert histories[0] == histories[1]
    assert any(state["items"] for state in histories[0]), "Nothing fell in 500 frames."
