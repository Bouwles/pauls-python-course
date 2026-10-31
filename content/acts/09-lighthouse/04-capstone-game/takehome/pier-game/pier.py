"""Mackerel Night: the rules of Caitlin's pier game, with no pygame in sight.

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
        """A new game: the bucket in the middle, score 0, three lives, level 1."""

    def move(self, direction):
        """Slide the bucket along the pier, but never off it."""

    def drop(self, kind, x):
        """Something new at the top of the screen."""

    def fall_speed(self):
        """3 + the level, in pixels per frame."""

    def update(self):
        """One frame of the game."""
        # Everything falls

        # Catch what's in the bucket; forget what's fallen past the bottom

        # The level, from the score

        # Three boots and it's over

        # Perhaps something new at the top

    def state(self):
        """What main.py needs to draw one frame."""
