"""Gwen's puzzle round: change for 50p, and how near an answer has to be."""

COINS = [1, 2, 5, 10, 20, 50, 100, 200]


def ways_to_pay(amount, coins):
    """How many different handfuls of coins make amount pence."""
    # A slot for every amount from 0 up; there's one way to make 0p: no coins
    ways = [1] + [0] * amount
    # One kind of coin at a time, so each handful is counted once
    for coin in coins:
        for pence in range(coin, amount + 1):
            ways[pence] = ways[pence] + ways[pence - coin]
    # The answer is in the last slot
    return ways[amount]


def edit_distance(given, correct):
    """The fewest letters put in, taken out or swapped to turn given into correct."""
    # The edges: turning some letters into none, or none into some
    table = [[0] * (len(correct) + 1) for _ in range(len(given) + 1)]
    for row in range(len(given) + 1):
        table[row][0] = row
    for col in range(len(correct) + 1):
        table[0][col] = col
    # Fill the rest, row by row
    for row in range(1, len(given) + 1):
        for col in range(1, len(correct) + 1):
            if given[row - 1] == correct[col - 1]:
                table[row][col] = table[row - 1][col - 1]
            else:
                table[row][col] = 1 + min(table[row - 1][col], table[row][col - 1], table[row - 1][col - 1])
    # The answer is in the last slot
    return table[len(given)][len(correct)]


def mark(given, correct):
    """'right', 'near enough' or 'wrong', ignoring capitals and spaces at either end."""
    given = given.strip().lower()
    correct = correct.strip().lower()
    if given == correct:
        return "right"
    if edit_distance(given, correct) <= len(correct) // 5:
        return "near enough"
    return "wrong"


if __name__ == "__main__":
    print(f"50p in change: {ways_to_pay(50, [1, 2, 5, 10, 20])} ways")
    for given, correct in [("Lighthose", "Lighthouse"), ("Whelk", "Whale")]:
        print(f"'{given}' for '{correct}': {mark(given, correct)}")
