TESTS = [
    output("300 km/h in mph", inputs=["1", "300"], expect="That's 186.41 mph.", match="last_line", visible=True,
           hint="input() gives text. \"1\" and 1 are never equal, so compare the choice with \"1\"."),
    output("100 knots in km/h", inputs=["2", "100"], expect="That's 185.20 km/h.", match="last_line", visible=True),
    output("Half a km/h", inputs=["1", "0.5"], expect="That's 0.31 mph.", match="last_line"),
    output("Not on the menu", inputs=["3", "12"], expect="No such option.", match="last_line",
           hint="Anything that isn't 1 or 2 should still get No such option."),
]
