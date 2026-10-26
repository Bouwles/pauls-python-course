def discounted_return(rewards, gamma):
    """The race's rewards, each one counting gamma times less than the one before."""
    total = 0
    for reward in reversed(rewards):
        total = reward + gamma * total
    return total


if __name__ == "__main__":
    race = [-1, -1, -1, -1, 10]
    print(round(discounted_return(race, 0.9), 2))
