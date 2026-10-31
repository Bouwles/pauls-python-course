TESTS = [
    output("A typo", inputs=["3", "12", "yse"], expect="Yes or no, please.", match="last_line", visible=True),
    output("Yes still means indoor", inputs=["3", "12", "yes"], expect="That's 2.40 km.", match="last_line", visible=True),
    output("No still means outdoor", inputs=["3", "12", "no"], expect="That's 4.80 km.", match="last_line"),
    output("An empty answer", inputs=["3", "12", ""], expect="Yes or no, please.", match="last_line"),
]
