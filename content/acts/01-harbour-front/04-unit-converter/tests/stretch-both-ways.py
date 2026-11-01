TESTS = [
    output("Ten mph", inputs=["4", "10"], expect="That's 16.09 km/h.", match="last_line", visible=True),
    output("The fourth option is on the menu", inputs=["4", "10"], expect="4. Mph to km/h", match="contains", visible=True),
    output("220 mph at Indianapolis", inputs=["4", "220"], expect="That's 354.06 km/h.", match="last_line"),
    output("Still no fifth option", inputs=["5", "10", "no"], expect="No such option.", match="last_line"),
]
