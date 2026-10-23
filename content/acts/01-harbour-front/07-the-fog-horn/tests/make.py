TESTS = [
    output("Three readings", inputs=["200", "150", "400", "clear"], expect="Readings: 3\nAverage: 250.0 metres",
           visible=True, timeout=3),
    output("One reading", inputs=["80", "clear"], expect="Readings: 1\nAverage: 80.0 metres",
           visible=True, timeout=3),
    output("Five readings", inputs=["100", "200", "250", "300", "75", "clear"],
           expect="Readings: 5\nAverage: 185.0 metres", timeout=3),
    output("An awkward average", inputs=["100", "200", "250", "clear"], expect="Readings: 3\nAverage: 183.3 metres",
           timeout=3, hint="Show the average to one decimal place, with an f-string like {average:.1f}."),
    output("No fog at all", inputs=["clear"], expect="No fog tonight.", timeout=3,
           hint="If clear comes first there are no readings, and dividing by zero crashes. Check the count before you divide."),
    output("A reading of zero", inputs=["0", "100", "clear"], expect="Readings: 2\nAverage: 50.0 metres", timeout=3,
           hint="0 metres is a real reading in thick fog. Only clear ends the loop."),
]
