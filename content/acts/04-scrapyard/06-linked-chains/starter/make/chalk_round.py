"""The kart track's crates, chalked crate to crate."""


class Crate:
    """One crate on the round: its part, and the next crate, or None."""
    # Each link knows its own thing and the next link


class Round:
    """The round of crates. It only knows its first crate, head."""
    # The chain only knows its first link

    # append(part):
    #     Make the new link
    #     An empty chain: the new link is the first
    #     Otherwise walk to the last link and hang it on

    # parts():
    #     Walk from the first link until there isn't a next one

    # __len__, insert_after(existing, part), remove(part), reverse()


if __name__ == "__main__":
    lot = Round()
    for part in ["axle", "brakes", "chassis", "drive-chain"]:
        lot.append(part)
    print("Round:", lot.parts())
    lot.insert_after("brakes", "fuel-tank")
    print("After the brakes, a fuel tank:", lot.parts())
    lot.remove("axle")
    print("Neil took the axle:", lot.parts())
    lot.reverse()
    print("From the far end:", lot.parts())
    print(len(lot), "crates")
