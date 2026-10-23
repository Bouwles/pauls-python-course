TESTS = [
    output("Two readings", inputs=["200", "300", "clear"], expect="Readings: 2\nAverage: 250.0 metres",
           visible=True, timeout=3,
           hint="Inside the loop, ask for the next reading. Otherwise reading never changes and the loop never ends."),
    output("Three readings", inputs=["100", "250", "400", "clear"], expect="Readings: 3\nAverage: 250.0 metres",
           timeout=3),
    output("One reading", inputs=["75", "clear"], expect="Readings: 1\nAverage: 75.0 metres", timeout=3),
]
