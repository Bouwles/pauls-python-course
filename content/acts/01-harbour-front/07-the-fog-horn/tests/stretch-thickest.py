TESTS = [
    output("Three readings", inputs=["200", "150", "400", "clear"],
           expect="Readings: 3\nAverage: 250.0 metres\nThickest: 150 metres", visible=True, timeout=3),
    output("Thickest first", inputs=["50", "300", "clear"],
           expect="Readings: 2\nAverage: 175.0 metres\nThickest: 50 metres", visible=True, timeout=3),
    output("Thickest last", inputs=["900", "600", "20", "clear"],
           expect="Readings: 3\nAverage: 506.7 metres\nThickest: 20 metres", timeout=3),
    output("No fog at all", inputs=["clear"], expect="No fog tonight.", timeout=3),
]
