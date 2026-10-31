TESTS = [
    output("Two laps", inputs=["92", "88", "stop"], expect="Laps: 2\nAverage: 90.0 seconds",
           visible=True, timeout=3,
           hint="Inside the loop, ask for the next lap. Otherwise lap never changes and the loop never ends."),
    output("Three laps", inputs=["95", "90", "85", "stop"], expect="Laps: 3\nAverage: 90.0 seconds",
           timeout=3),
    output("One lap", inputs=["75", "stop"], expect="Laps: 1\nAverage: 75.0 seconds", timeout=3),
]
