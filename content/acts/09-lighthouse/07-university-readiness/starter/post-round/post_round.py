"""Question 3: the courier's round."""


def round_order(parcels):
    """The labels of the parcels, in the order they're delivered."""
    pass


if __name__ == "__main__":
    # Tests first: the examples from the question, then your own edge cases.
    assert round_order([("A", "Queen's Row", 4), ("B", "Queen's Row", 1),
                        ("C", "Queen's Row", 3), ("D", "Queen's Row", 2)]) == ["B", "C", "A", "D"]
    assert round_order([("E", "Queen's Row", 2), ("F", "High Street", 5),
                        ("G", "Queen's Row", 2), ("H", "High Street", 2)]) == ["F", "H", "E", "G"]
    print("All my tests pass.")
