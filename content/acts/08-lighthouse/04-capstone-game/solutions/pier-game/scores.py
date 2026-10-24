"""The high-score table on the side of the cabinet, kept in a JSON file.

add_score(path, initials, score)
        record a score; initials are one to three letters, kept in capitals
top_scores(path, count=5)
        the best scores as (initials, score) pairs, highest first; of two
        equal scores, the one set first stays above; [] if there's no file yet
"""
import json
import os
from pathlib import Path


def _load(path):
    if not Path(path).exists():
        return []
    with open(path, encoding="utf-8") as table_file:
        return json.load(table_file)


def add_score(path, initials, score):
    """Record a score under one to three letters, in capitals."""
    initials = initials.strip().upper()
    if not (1 <= len(initials) <= 3 and initials.isalpha()):
        raise ValueError("Initials are one to three letters, as on any proper cabinet.")
    table = _load(path) + [[initials, score]]
    spare = Path(str(path) + ".new")
    with open(spare, "w", encoding="utf-8") as table_file:
        json.dump(table, table_file)
    os.replace(spare, path)


def top_scores(path, count=5):
    """The best scores, highest first; ties keep the order they were set in."""
    table = sorted(_load(path), key=lambda entry: entry[1], reverse=True)
    return [(initials, score) for initials, score in table[:count]]
