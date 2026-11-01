TESTS = [
    output("Two readings", inputs=["14", "12", "stop"], expect="Readings: 2\nAverage: 13.0 degrees",
           visible=True, timeout=3,
           hint="Inside the loop, ask for the next reading. Otherwise reading never changes and the loop never ends."),
    output("Three readings", inputs=["15", "12", "9", "stop"], expect="Readings: 3\nAverage: 12.0 degrees",
           timeout=3),
    output("One reading", inputs=["11", "stop"], expect="Readings: 1\nAverage: 11.0 degrees", timeout=3),
]
