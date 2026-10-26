"""Mackerel Night: the rules of Gwen's pier game, with no pygame in sight.

Everything here can be tested without a window. main.py does the drawing.

Game(seed=None, spawn=True)
        a new game: the bucket in the middle of the pier, score 0, three
        lives, level 1, nothing falling. seed fixes the random falls;
        spawn=False means nothing falls unless drop() says so
game.move(direction)
        -1 moves the bucket left by BUCKET_SPEED, 1 right, 0 not at all,
        never off either end of the pier
game.drop(kind, x)
        a "mackerel" or a "boot" appears at the top, its left edge at x
game.update()
        one frame: everything falls fall_speed() pixels; whatever overlaps
        the bucket is caught (a mackerel scores 1, a boot costs a life);
        whatever falls past the bottom is gone; then, if spawning, something
        new may appear at the top
game.fall_speed()
        3 + the level, in pixels per frame
game.state()
        everything main.py needs to draw a frame, as a dictionary
"""
import random
from dataclasses import dataclass

WIDTH, HEIGHT = 480, 640
BUCKET_WIDTH, BUCKET_HEIGHT = 64, 24
BUCKET_Y = 600
BUCKET_SPEED = 8
ITEM_SIZE = 24
START_LIVES = 3
MAX_LEVEL = 9
KINDS = ("mackerel", "boot")


@dataclass
class Item:
    kind: str
    x: int
    y: int = 0


class Game:
    def __init__(self, seed=None, spawn=True):
        self.rng = random.Random(seed)
        self.spawn = spawn
        self.bucket_x = (WIDTH - BUCKET_WIDTH) // 2
        self.items = []
        self.score = 0
        self.lives = START_LIVES
        self.level = 1
        self.over = False

    def move(self, direction):
        """Slide the bucket along the pier, but never off it."""
        if self.over:
            return
        self.bucket_x = min(max(self.bucket_x + direction * BUCKET_SPEED, 0), WIDTH - BUCKET_WIDTH)

    def drop(self, kind, x):
        """Something new at the top of the screen."""
        if kind not in KINDS:
            raise ValueError(f"Only {' or '.join(KINDS)} fall on Gwen's pier, not {kind!r}.")
        if not self.over:
            self.items.append(Item(kind, x))

    def fall_speed(self):
        return 3 + self.level

    def in_bucket(self, item):
        """True if the item overlaps the bucket. Touching edges don't count."""
        return (item.x < self.bucket_x + BUCKET_WIDTH and item.x + ITEM_SIZE > self.bucket_x
                and item.y < BUCKET_Y + BUCKET_HEIGHT and item.y + ITEM_SIZE > BUCKET_Y)

    def update(self):
        """One frame of the game."""
        if self.over:
            return
        still_falling = []
        for item in self.items:
            item.y += self.fall_speed()
            if self.in_bucket(item):
                if item.kind == "mackerel":
                    self.score += 1
                else:
                    self.lives -= 1
            elif item.y <= HEIGHT:
                still_falling.append(item)
        self.items = still_falling
        self.level = min(1 + self.score // 10, MAX_LEVEL)
        if self.lives <= 0:
            self.lives = 0
            self.over = True
            return
        if self.spawn and self.rng.random() < 0.02 + 0.01 * self.level:
            kind = "boot" if self.rng.random() < 0.25 else "mackerel"
            self.items.append(Item(kind, self.rng.randrange(0, WIDTH - ITEM_SIZE + 1)))

    def state(self):
        """What main.py needs to draw one frame."""
        return {
            "bucket_x": self.bucket_x,
            "items": [{"kind": item.kind, "x": item.x, "y": item.y} for item in self.items],
            "score": self.score,
            "lives": self.lives,
            "level": self.level,
            "over": self.over,
        }
