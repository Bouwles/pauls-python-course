TESTS = [
    output("Twelve knots in mph", inputs=["1", "12"], expect="That's 13.81 mph.", match="last_line", visible=True,
           hint="input() gives text. \"1\" and 1 are never equal, so compare the choice with \"1\"."),
    output("Twelve knots in km/h", inputs=["2", "12"], expect="That's 22.22 km/h.", match="last_line", visible=True),
    output("Half a knot", inputs=["1", "0.5"], expect="That's 0.58 mph.", match="last_line"),
    output("Not on the menu", inputs=["3", "12"], expect="No such option.", match="last_line",
           hint="Anything that isn't 1 or 2 should still get No such option."),
]
