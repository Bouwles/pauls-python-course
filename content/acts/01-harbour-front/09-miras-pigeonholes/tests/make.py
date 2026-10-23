THREE = ["Bea Hollis", "Old Tom", "Agnes Rook"]


def listing(names):
    return [f"Hole {n}: {name}" for n, name in enumerate(names)]


def expect(names, *rest):
    return "\n".join(listing(names) + list(rest))


TESTS = [
    output("Old Tom collects", inputs=THREE + ["done", "Old Tom"],
           expect=expect(THREE, "Hole 1.", "Parcels left: 2"), visible=True, timeout=3),
    output("Nothing for Dennis", inputs=THREE + ["done", "Dennis"],
           expect=expect(THREE, "Nothing for Dennis today.", "Parcels left: 3"), visible=True, timeout=3),
    output("Gwen, in the first hole", inputs=["Gwen", "Mira", "done", "Gwen"],
           expect=expect(["Gwen", "Mira"], "Hole 0.", "Parcels left: 1"), timeout=3,
           hint="The first hole is hole 0. If this is the only one failing, check where your numbering starts."),
    output("Kat, in the last hole", inputs=["Moss", "Pip", "Dev", "Kat", "done", "Kat"],
           expect=expect(["Moss", "Pip", "Dev", "Kat"], "Hole 3.", "Parcels left: 3"), timeout=3),
    output("A quiet day", inputs=["done", "Agnes Rook"],
           expect="Nothing for Agnes Rook today.\nParcels left: 0", timeout=3,
           hint="With no parcels the list is empty. Loops over it run zero times, and nothing should crash."),
    output("Tom is not Old Tom", inputs=["Old Tom", "done", "Tom"],
           expect=expect(["Old Tom"], "Nothing for Tom today.", "Parcels left: 1"), timeout=3,
           hint="Tom and Old Tom are different people. Compare whole names with in or ==, not parts of names."),
]
