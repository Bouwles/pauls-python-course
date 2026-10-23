TESTS = [
    output("Three loaves", inputs=["bread", "3"], expect="That's 7.20, please.", visible=True),
    output("Four buns", inputs=["bun", "4"], expect="That's 3.40, please.", visible=True),
    output("No loaves", inputs=["bread", "0"], expect="That's 0.00, please.",
           hint="If this is the only one failing, check what happens when the order is zero."),
]
