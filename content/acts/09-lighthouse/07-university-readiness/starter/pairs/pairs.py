"""Question 4: two for a pound."""


def count_pairs(prices, target):
    """How many pairs of different items have prices adding up to exactly target."""
    pairs = 0
    for first in range(len(prices)):
        for second in range(first + 1, len(prices)):
            if prices[first] + prices[second] == target:
                pairs += 1
    return pairs


if __name__ == "__main__":
    # Tests first: the examples from the question, then your own edge cases.
    assert count_pairs([30, 70, 50, 50, 20], 100) == 2
    assert count_pairs([50, 50, 50], 100) == 3
    print("All my tests pass.")
