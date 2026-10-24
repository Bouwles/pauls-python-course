"""Question 4: two for a pound."""


def count_pairs(prices, target):
    """How many pairs of different items have prices adding up to exactly target."""
    seen = {}       # price: how many items at that price so far
    pairs = 0
    for price in prices:
        # Every earlier item at the missing price makes a pair with this one.
        pairs += seen.get(target - price, 0)
        seen[price] = seen.get(price, 0) + 1
    return pairs


if __name__ == "__main__":
    # Tests first: the examples from the question, then my own edge cases.
    assert count_pairs([30, 70, 50, 50, 20], 100) == 2
    assert count_pairs([50, 50, 50], 100) == 3
    assert count_pairs([], 100) == 0
    assert count_pairs([50], 100) == 0
    assert count_pairs([30, 30, 70, 70], 100) == 4
    print("All my tests pass.")
