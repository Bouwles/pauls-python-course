TESTS = [
    output("A typo", inputs=["3", "11", "yse"], expect="Yes or no, please.", match="last_line", visible=True),
    output("Yes still means sea miles", inputs=["3", "11", "yes"], expect="That's 20.37 km.", match="last_line", visible=True),
    output("No still means land miles", inputs=["3", "11", "no"], expect="That's 17.70 km.", match="last_line"),
    output("An empty answer", inputs=["3", "11", ""], expect="Yes or no, please.", match="last_line"),
]
