"""Question 2: the poster vote."""


def winner(ballots):
    """The name with the most votes. On a tie, the one that got there first."""
    pass


if __name__ == "__main__":
    # Tests first: the examples from the question, then your own edge cases.
    assert winner(["Gull", "Tern", "Gull"]) == "Gull"
    assert winner(["Kittiwake", "Gannet", "Gannet", "Kittiwake", "Puffin"]) == "Gannet"
    print("All my tests pass.")
