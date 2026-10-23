"""Mira's postcard records."""
from dataclasses import dataclass, replace
from enum import Enum

# List the choices: Stamp, with FIRST 135, SECOND 85 and ABROAD 220


# Describe one record, frozen, with types: Postcard
#   sender, to, stamp, and message (default "")
# Add behaviour as methods: postage()


# Functions take and give typed values:
#   total_postage(cards) and redirect(card, town)


if __name__ == "__main__":
    cards = [
        Postcard("Bea", "Truro", Stamp.FIRST, "Wish you were here"),
        Postcard("Tom", "Lisbon", Stamp.ABROAD),
        Postcard("Gwen", "Bodmin", Stamp.SECOND),
    ]
    print(cards[0])
    print(f"Postage today: {total_postage(cards)} pence")
    moved = redirect(cards[0], "Penzance")
    print(f"Redirected to {moved.to}; the original still says {cards[0].to}")
