TESTS = [
    output("Two for Old Tom", inputs=["Old Tom", "Bea Hollis", "Old Tom", "done", "Old Tom"],
           expect="Hole 0: Old Tom\nHole 1: Bea Hollis\nHole 2: Old Tom\nHole 0.\nParcels left: 2", visible=True, timeout=3),
    output("Two for Gwen, later on", inputs=["Moss", "Gwen", "Pip", "Gwen", "done", "Gwen"],
           expect="Hole 0: Moss\nHole 1: Gwen\nHole 2: Pip\nHole 3: Gwen\nHole 1.\nParcels left: 3", timeout=3),
    output("Only one", inputs=["Bea Hollis", "Old Tom", "done", "Old Tom"],
           expect="Hole 0: Bea Hollis\nHole 1: Old Tom\nHole 1.\nParcels left: 1", timeout=3),
]
