"""Question 3: the post round."""


def round_order(parcels):
    """The labels of the parcels, in the order they're delivered."""
    pass


if __name__ == "__main__":
    # Tests first: the examples from the question, then your own edge cases.
    assert round_order([("A", "Quay Row", 4), ("B", "Quay Row", 1),
                        ("C", "Quay Row", 3), ("D", "Quay Row", 2)]) == ["B", "C", "A", "D"]
    assert round_order([("E", "Quay Row", 2), ("F", "High Street", 5),
                        ("G", "Quay Row", 2), ("H", "High Street", 2)]) == ["F", "H", "E", "G"]
    print("All my tests pass.")
