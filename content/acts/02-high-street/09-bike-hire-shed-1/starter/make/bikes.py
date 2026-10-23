"""Dev and Kat's bikes."""


class Bike:
    """One bike in the shed."""

    # Give each new one its starting attributes: number, kind, rate, rider, hours

    # Methods that change the object: hire(rider), give_back(hours)

    # Methods that answer a question about it: describe()


if __name__ == "__main__":
    red = Bike(7, "town", 4)
    print(red.describe())
    red.hire("Bea")
    print(red.describe())
    cost = red.give_back(3)
    print(f"Bea owes £{cost:.2f}")
