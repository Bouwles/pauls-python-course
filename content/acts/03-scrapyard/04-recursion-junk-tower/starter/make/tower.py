"""Weighing Nell's junk tower, and packing the lorry."""

# A crate is a list. A number in it is a part, in kilos; a list in it is a crate inside.
PIER_TOWER = [4, [2, 3], [1, [5, [6]]]]


# Lorry packer, from Penhallow's stock program.
# How many ways to fill a lorry bed, end to end, with 1 m and 2 m crates.
# It writes nothing down, so it works out the same short beds again and again.
# The machine on the hill writes everything down and never works anything out
# twice. Between the two of them, there's one sensible program. A.P.
def packings(length):
    if length < 0:
        return 0
    if length == 0:
        return 1
    return packings(length - 1) + packings(length - 2)


if __name__ == "__main__":
    print(f"12 m lorry: {packings(12)} packings")
