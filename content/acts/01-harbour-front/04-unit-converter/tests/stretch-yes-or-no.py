TESTS = [
    output("A typo", inputs=["3", "2", "yse"], expect="Yes or no, please.", match="last_line", visible=True),
    output("Yes still means sea level", inputs=["3", "1", "yes"], expect="That's 1225.00 km/h.", match="last_line", visible=True),
    output("No still means high up", inputs=["3", "2", "no"], expect="That's 2124.00 km/h.", match="last_line"),
    output("An empty answer", inputs=["3", "2", ""], expect="Yes or no, please.", match="last_line"),
]
