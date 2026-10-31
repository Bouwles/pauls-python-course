TESTS = [
    output("Twelve km in miles", inputs=["1", "12"], expect="That's 7.46 miles.", match="last_line", visible=True,
           hint="input() gives text. \"1\" and 1 are never equal, so compare the choice with \"1\"."),
    output("A pace of six minutes a km", inputs=["2", "6"], expect="That's 9.66 min per mile.", match="last_line", visible=True),
    output("Half a km", inputs=["1", "0.5"], expect="That's 0.31 miles.", match="last_line"),
    output("Not on the menu", inputs=["3", "12"], expect="No such option.", match="last_line",
           hint="Anything that isn't 1 or 2 should still get No such option."),
]
