TESTS = [
    output("Three loaves", inputs=["bread", "3"], expect="That's 7.20, please.", visible=True),
    output("Two buns", inputs=["bun", "2"], expect="That's 1.70, please.", visible=True),
    output("One loaf", inputs=["bread", "1"], expect="That's 2.40, please."),
    output("Ten buns", inputs=["bun", "10"], expect="That's 8.50, please."),
    output("No buns", inputs=["bun", "0"], expect="That's 0.00, please.",
           hint="If this is the only one failing, check what happens when the order is zero."),
    output("Bread with a capital B", inputs=["Bread", "2"], expect="That's 4.80, please.", stretch=True,
           hint="This one is a stretch: customers don't always type in lower case."),
]
