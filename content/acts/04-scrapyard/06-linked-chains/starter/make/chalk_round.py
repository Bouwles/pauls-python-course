"""The kart track's crates, chalked crate to crate."""


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
