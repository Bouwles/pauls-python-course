"""The merchant's round, chalked crate to crate."""


if __name__ == "__main__":
    merchant = Round()
    for part in ["anchor", "bell", "chain", "drum"]:
        merchant.append(part)
    print("Round:", merchant.parts())
    merchant.insert_after("bell", "gong")
    print("After the bell, a gong:", merchant.parts())
    merchant.remove("anchor")
    print("The merchant took the anchor:", merchant.parts())
    merchant.reverse()
    print("From the far gate:", merchant.parts())
    print(len(merchant), "crates")
