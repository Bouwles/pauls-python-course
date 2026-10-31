TESTS = [
    output("Ten miles", inputs=["4", "10"], expect="That's 16.09 km.", match="last_line", visible=True),
    output("The fourth option is on the menu", inputs=["4", "10"], expect="4. Miles to km", match="contains", visible=True),
    output("A marathon in miles", inputs=["4", "26.2"], expect="That's 42.16 km.", match="last_line"),
    output("Still no fifth option", inputs=["5", "10", "no"], expect="No such option.", match="last_line"),
]
