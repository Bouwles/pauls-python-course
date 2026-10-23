TESTS = [
    output("Bread", inputs=["Bread", "2"], expect="That's 4.80, please.", visible=True),
    output("BREAD", inputs=["BREAD", "1"], expect="That's 2.40, please.", visible=True),
    output("Spaces round it", inputs=["  bread ", "3"], expect="That's 7.20, please."),
    output("Bun still works", inputs=["Bun", "2"], expect="That's 1.70, please."),
]
