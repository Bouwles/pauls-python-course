TESTS = [
    output("Ten kilometres", inputs=["4", "10"], expect="That's 6.21 miles.", match="last_line", visible=True),
    output("The fourth option is on the menu", inputs=["4", "10"], expect="4. Km to miles", match="contains", visible=True),
    output("Twenty kilometres", inputs=["4", "20.37"], expect="That's 12.66 miles.", match="last_line"),
    output("Still no fifth option", inputs=["5", "10", "no"], expect="No such option.", match="last_line"),
]
