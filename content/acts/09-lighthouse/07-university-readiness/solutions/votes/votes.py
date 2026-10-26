"""Question 2: naming the lifeboat."""


def winner(ballots):
    """The name with the most votes. On a tie, the one that got there first."""
    counts = {}
    leader = None
    most = 0
    for name in ballots:
        counts[name] = counts.get(name, 0) + 1
        # Strictly more: a name that only draws level hasn't got there first.
        if counts[name] > most:
            most = counts[name]
            leader = name
    return leader


if __name__ == "__main__":
    # Tests first: the examples from the question, then my own edge cases.
    assert winner(["Gull", "Tern", "Gull"]) == "Gull"
    assert winner(["Kittiwake", "Gannet", "Gannet", "Kittiwake", "Puffin"]) == "Gannet"
    assert winner([]) is None
    assert winner(["Auk", "Tern", "Gull"]) == "Auk"
    print("All my tests pass.")
