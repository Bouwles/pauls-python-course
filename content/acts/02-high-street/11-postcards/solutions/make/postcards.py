"""Mira's postcard records."""
from dataclasses import dataclass, replace
from enum import Enum


# List the choices: Stamp, with FIRST 135, SECOND 85 and ABROAD 220
class Stamp(Enum):
    FIRST = 135
    SECOND = 85
    ABROAD = 220


# Describe one record, frozen, with types: Postcard
@dataclass(frozen=True)
class Postcard:
    """One postcard, as it was posted. It never changes."""

    sender: str
    to: str
    stamp: Stamp
    message: str = ""

    # Add behaviour as methods: postage()
    def postage(self) -> int:
        return self.stamp.value


# Functions take and give typed values
def total_postage(cards: list[Postcard]) -> int:
    """Postage in pence for a bag of postcards."""
    total = 0
    for card in cards:
        total += card.postage()
    return total


def redirect(card: Postcard, town: str) -> Postcard:
    """A new postcard going to town. The original stays as it was."""
    return replace(card, to=town)


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
