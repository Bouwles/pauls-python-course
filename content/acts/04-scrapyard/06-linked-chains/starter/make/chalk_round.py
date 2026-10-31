"""The clockmaker's round, chalked crate to crate."""


if __name__ == "__main__":
    lot = Round()
    for part in ["anchor", "bell", "chain", "drum"]:
        lot.append(part)
    print("Round:", lot.parts())
    lot.insert_after("bell", "gong")
    print("After the bell, a gong:", lot.parts())
    lot.remove("anchor")
    print("Paul took the anchor:", lot.parts())
    lot.reverse()
    print("From the far end:", lot.parts())
    print(len(lot), "crates")
