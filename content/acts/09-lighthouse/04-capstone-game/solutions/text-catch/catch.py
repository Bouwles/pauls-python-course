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
        self.columns = columns
        self.rows = rows
        self.bucket = columns // 2
        self.falling = []
        self.score = 0
        self.lives = 3
        self.over = False

    def move(self, step):
        """One column left or right, never off the pier."""
        if not self.over:
            self.bucket = min(max(self.bucket + step, 0), self.columns - 1)

    def drop(self, kind, column):
        """Something new at the top."""
        if kind not in ("fish", "boot"):
            raise ValueError(f"Only fish and boots fall on Gwen's pier, not {kind!r}.")
        if not self.over:
            self.falling.append([kind, column, 0])

    def update(self):
        """One turn: everything falls a row, and the bottom row is settled."""
        if self.over:
            return
        still_falling = []
        for kind, column, row in self.falling:
            row += 1
            if row < self.rows - 1:
                still_falling.append([kind, column, row])
            elif column == self.bucket:
                if kind == "fish":
                    self.score += 1
                else:
                    self.lives -= 1
        self.falling = still_falling
        if self.lives <= 0:
            self.over = True

    def render(self):
        """The pier as text, one string per row."""
        grid = [["."] * self.columns for _ in range(self.rows - 1)]
        for kind, column, row in self.falling:
            grid[row][column] = kind[0]
        pier = ["_"] * self.columns
        pier[self.bucket] = "U"
        return ["".join(row) for row in grid] + ["".join(pier)]


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
