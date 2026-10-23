LOAF_TWO = "flour: 1000 g\nwater: 700 ml\nyeast: 14 g\nsalt: 20 g\nbutter: 50 g"


def labels_go_on(ctx):
    mod = ctx.module()
    labels = mod.tray_labels()
    got = [next(labels) for _ in range(100)]
    if got[0] != "Tray 1" or got[-1] != "Tray 100":
        raise CheckFailed("tray_labels should keep counting for as long as it's asked.", expected="Tray 1 ... Tray 100", actual=f"{got[0]} ... {got[-1]}")


TESTS = [
    output("Two batches, two trays", inputs=["2"], expect=LOAF_TWO + "\nTray 1\nTray 2", visible=True),
    custom("tray_labels never runs out", labels_go_on, visible=True, timeout=5),
    output("No batches, no trays", inputs=["0"], expect="flour: 0 g\nwater: 0 ml\nyeast: 0 g\nsalt: 0 g\nbutter: 0 g",
           hint="Zero batches needs no labels at all."),
]
