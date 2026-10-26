def _game(ctx, *args):
    mod = ctx.module()
    if not isinstance(getattr(mod, "Catch", None), type):
        raise CheckFailed("catch.py needs a class called Catch.")
    return mod.Catch(*args)


def _render(game):
    rows = game.render()
    if not isinstance(rows, list) or not all(isinstance(row, str) for row in rows):
        raise CheckFailed("render() should give back a list of strings, one per row.", actual=repr(rows)[:200])
    return rows


def _counts(game):
    return (game.score, game.lives, game.over)


def new_game(ctx):
    game = _game(ctx)
    want = [".......", ".......", ".......", ".......", "___U___"]
    got = _render(game)
    if got != want:
        raise CheckFailed("A new pier: four empty rows, then the bucket in the middle of the bottom row.", expected=want, actual=got)
    if _counts(game) != (0, 3, False):
        raise CheckFailed("A new game has score 0, three lives, and isn't over.", expected="(0, 3, False)", actual=str(_counts(game)))


def fish_caught(ctx):
    game = _game(ctx)
    game.drop("fish", 3)
    if _render(game)[0] != "...f...":
        raise CheckFailed("A dropped fish appears in row 0.", expected="...f...", actual=_render(game)[0])
    for _ in range(3):
        game.update()
    if _render(game)[3] != "...f..." or game.score != 0:
        raise CheckFailed("After three turns the fish is in row 3, just above the bucket, and not caught yet.",
                          expected="row 3: ...f..., score 0", actual=f"row 3: {_render(game)[3]}, score {game.score}")
    game.update()
    if game.score != 1 or _render(game)[:4] != ["......."] * 4:
        raise CheckFailed("On the fourth turn the fish lands in the bucket: score 1, and it's gone.",
                          expected="score 1, empty rows", actual=f"score {game.score}, rows {_render(game)[:4]}")


def moves(ctx):
    game = _game(ctx)
    game.move(1)
    game.move(1)
    if _render(game)[-1] != "_____U_":
        raise CheckFailed("Two steps right from the middle.", expected="_____U_", actual=_render(game)[-1])
    for _ in range(5):
        game.move(1)
    if _render(game)[-1] != "______U":
        raise CheckFailed("The bucket stops at the right-hand end.", expected="______U", actual=_render(game)[-1])
    for _ in range(10):
        game.move(-1)
    if _render(game)[-1] != "U______":
        raise CheckFailed("And at the left-hand end.", expected="U______", actual=_render(game)[-1])


def boot_caught(ctx):
    game = _game(ctx)
    game.drop("boot", 3)
    if _render(game)[0] != "...b...":
        raise CheckFailed("A boot is drawn as b.", expected="...b...", actual=_render(game)[0])
    for _ in range(4):
        game.update()
    if _counts(game) != (0, 2, False):
        raise CheckFailed("A boot in the bucket costs a life.", expected="(0, 2, False)", actual=str(_counts(game)))


def missed(ctx):
    game = _game(ctx)
    game.drop("fish", 0)
    game.drop("boot", 6)
    for _ in range(4):
        game.update()
    if _counts(game) != (0, 3, False) or _render(game)[:4] != ["......."] * 4:
        raise CheckFailed("Anything that reaches the bottom away from the bucket is missed, costs nothing, and is gone.",
                          expected="(0, 3, False), empty rows", actual=f"{_counts(game)}, rows {_render(game)[:4]}")


def one_after_another(ctx):
    game = _game(ctx)
    game.drop("fish", 3)
    game.update()
    game.drop("boot", 3)
    if _render(game)[:2] != ["...b...", "...f..."]:
        raise CheckFailed("Each thing falls on its own: the boot at the top, the fish a row below.",
                          expected=["...b...", "...f..."], actual=_render(game)[:2])
    for _ in range(3):
        game.update()
    if _counts(game) != (1, 3, False):
        raise CheckFailed("The fish lands a turn before the boot.", expected="(1, 3, False)", actual=str(_counts(game)))
    game.update()
    if _counts(game) != (1, 2, False):
        raise CheckFailed("Then the boot.", expected="(1, 2, False)", actual=str(_counts(game)))


def game_over(ctx):
    game = _game(ctx)
    for column in (3, 3, 3):
        game.drop("boot", column)
        for _ in range(4):
            game.update()
    if _counts(game) != (0, 0, True):
        raise CheckFailed("Three boots and the game is over.", expected="(0, 0, True)", actual=str(_counts(game)))
    before = _render(game)
    game.move(1)
    game.drop("fish", 3)
    game.update()
    if _render(game) != before or _counts(game) != (0, 0, True):
        raise CheckFailed("Once it's over, moving, dropping and updating change nothing.", expected=before, actual=_render(game))


def other_sizes(ctx):
    game = _game(ctx, 5, 3)
    if _render(game) != [".....", ".....", "__U__"]:
        raise CheckFailed("Catch(5, 3): a pier five wide, two rows to fall through.", expected=[".....", ".....", "__U__"], actual=_render(game))
    game.drop("fish", 2)
    game.update()
    game.update()
    if game.score != 1:
        raise CheckFailed("On a pier three rows high, a fish lands on the second turn.", expected=1, actual=game.score)


def no_gulls(ctx):
    game = _game(ctx)
    try:
        game.drop("gull", 3)
    except ValueError:
        return
    raise CheckFailed("Only fish and boots fall. drop('gull', 3) should raise a ValueError.")


TESTS = [
    custom("A new game", new_game, visible=True),
    custom("A fish dropped over the bucket lands on the fourth turn", fish_caught, visible=True),
    custom("The bucket moves, and stops at the ends", moves),
    custom("A boot in the bucket costs a life", boot_caught),
    custom("A miss costs nothing, and is gone", missed,
           hint="If only this fails: whatever reaches the bottom row goes, caught or not."),
    custom("Two things in one column fall one after the other", one_after_another),
    custom("Three boots, and it's over", game_over,
           hint="If only this fails, check that move, drop and update do nothing once the game is over."),
    custom("A smaller pier", other_sizes,
           hint="If only this fails, use self.columns and self.rows everywhere instead of 7 and 5."),
    custom("Only fish and boots", no_gulls),
]
