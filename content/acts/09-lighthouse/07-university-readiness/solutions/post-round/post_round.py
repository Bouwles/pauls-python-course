"""Question 3: the courier's round."""


def delivery_key(parcel):
    """Street first; then the odd side going up, then the even side coming back down."""
    label, street, number = parcel
    if number % 2 == 1:
        return (street, 0, number)
    return (street, 1, -number)


def round_order(parcels):
    """The labels of the parcels, in the order they're delivered."""
    # sorted() is stable, so parcels for the same house keep the order they came in.
    in_order = sorted(parcels, key=delivery_key)
    return [label for label, street, number in in_order]


if __name__ == "__main__":
    # Tests first: the examples from the question, then my own edge cases.
    assert round_order([("A", "Queen's Row", 4), ("B", "Queen's Row", 1),
                        ("C", "Queen's Row", 3), ("D", "Queen's Row", 2)]) == ["B", "C", "A", "D"]
    assert round_order([("E", "Queen's Row", 2), ("F", "High Street", 5),
                        ("G", "Queen's Row", 2), ("H", "High Street", 2)]) == ["F", "H", "E", "G"]
    assert round_order([]) == []
    assert round_order([("Z", "Queen's Row", 7), ("M", "Queen's Row", 7)]) == ["Z", "M"]
    print("All my tests pass.")
