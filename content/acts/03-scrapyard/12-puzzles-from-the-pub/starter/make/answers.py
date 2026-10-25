"""Gwen's puzzle round: change for 50p, and how near an answer has to be."""

COINS = [1, 2, 5, 10, 20, 50, 100, 200]


def ways_to_pay(amount, coins):
    """How many different handfuls of coins make amount pence."""


def edit_distance(given, correct):
    """The fewest letters put in, taken out or swapped to turn given into correct."""


def mark(given, correct):
    """'right', 'near enough' or 'wrong', ignoring capitals and spaces at either end."""


if __name__ == "__main__":
    print(f"50p in change: {ways_to_pay(50, [1, 2, 5, 10, 20])} ways")
    for given, correct in [("Lighthose", "Lighthouse"), ("Whelk", "Whale")]:
        print(f"'{given}' for '{correct}': {mark(given, correct)}")
