"""Mackerel Night in text, to try the rules before there's a window.

Catch(columns=7, rows=5)
        a pier `columns` cells wide; things fall from row 0 towards the
        bottom row, where the bucket waits in the middle column
        (columns // 2). score starts at 0, lives at 3, over at False
game.move(step)
        -1 moves the bucket one column left, 1 one column right; never off
        either end, and not at all once the game is over
game.drop(kind, column)
        a "fish" or a "boot" appears in row 0 of that column
game.update()
        everything falls one row. Whatever reaches the bottom row is caught
        if it's in the bucket's column (a fish scores 1, a boot costs a
        life) and missed if not; either way it's gone. No lives left, and
        the game is over
game.render()
        the pier as a list of strings, one per row: "." for an empty cell,
        "f" for a fish, "b" for a boot; the bottom row is "_" with a "U"
        where the bucket is
"""
import random


class Catch:
    def __init__(self, columns=7, rows=5):
        """A new game: the bucket in the middle column, score 0, three lives."""

    def move(self, step):
        """One column left or right, never off the pier."""

    def drop(self, kind, column):
        """Something new at the top."""

    def update(self):
        """One turn: everything falls a row, and the bottom row is settled."""
        # Everything falls one row

        # The bottom row: caught in the bucket's column, missed anywhere else

        # No lives left, and it's over

    def render(self):
        """The pier as text, one string per row."""


if __name__ == "__main__":
    # The game loop: draw, read the input, update. It never changes the rules.
    game = Catch()
    turn = 0
    while not game.over:
        print("\n".join(game.render()))
        print(f"Score {game.score}   Lives {game.lives}")
        key = input("a for left, d for right, Enter to wait, q to stop: ")
        if key == "q":
            break
        game.move({"a": -1, "d": 1}.get(key, 0))
        if turn % 2 == 0:
            game.drop(random.choice(["fish", "fish", "boot"]), random.randrange(game.columns))
        game.update()
        turn += 1
    print(f"Final score: {game.score}")
