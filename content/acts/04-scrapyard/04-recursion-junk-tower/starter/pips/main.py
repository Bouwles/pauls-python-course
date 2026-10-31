def pulls(height):
    """How many pulls of the hoist rope bring the basket down from height metres.

    Each pull lowers it 2 m, and the basket stops when it reaches the ground.
    """
    if height == 0:
        return 0
    return 1 + pulls(height - 2)


if __name__ == "__main__":
    print(pulls(8))
    print(pulls(7))
