from dataclasses import dataclass
from enum import Enum


class Stamp(Enum):
    FIRST = 135
    SECOND = 85
    ABROAD = 220


@dataclass(frozen=True)
class Postcard:
    sender: str
    to: str
    stamp: Stamp


def count_abroad(cards: list[Postcard]) -> int:
    count = 0
    for card in cards:
        if card.stamp == Stamp.ABROAD:
            count += 1
    return count


cards = [
    Postcard("Tom", "Lisbon", Stamp.ABROAD),
    Postcard("Bea", "Truro", Stamp.FIRST),
    Postcard("Ferro", "Bilbao", Stamp.ABROAD),
]
print(count_abroad(cards), "going abroad")
