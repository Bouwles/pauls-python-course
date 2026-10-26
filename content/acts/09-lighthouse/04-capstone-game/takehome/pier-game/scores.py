"""The high-score table on the side of the cabinet, kept in a JSON file.

add_score(path, initials, score)
        record a score; initials are one to three letters, kept in capitals
top_scores(path, count=5)
        the best scores as (initials, score) pairs, highest first; of two
        equal scores, the one set first stays above; [] if there's no file yet
"""
import json
from pathlib import Path


def add_score(path, initials, score):
    """Record a score under one to three letters, in capitals."""


def top_scores(path, count=5):
    """The best scores, highest first; ties keep the order they were set in."""
