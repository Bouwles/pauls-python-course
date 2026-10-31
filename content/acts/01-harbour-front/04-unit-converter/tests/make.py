MENU = "1. Km to miles\n2. Min per km to min per mile\n3. Laps to km"

TESTS = [
    output("Twelve outdoor laps", inputs=["3", "12", "no"], expect="That's 4.80 km.", match="last_line", visible=True),
    output("A pace of five minutes a km", inputs=["2", "5"], expect="That's 8.05 min per mile.", match="last_line", visible=True),
    output("The menu comes first", inputs=["1", "12"], expect=MENU, match="contains",
           hint="Print the three menu lines exactly as in the brief, before asking for a choice."),
    output("Ten km in miles", inputs=["1", "10"], expect="That's 6.21 miles.", match="last_line"),
    output("Twelve indoor laps", inputs=["3", "12", "yes"], expect="That's 2.40 km.", match="last_line",
           hint="An indoor lap is 0.2 km. Only yes means indoor."),
    output("Half a km", inputs=["1", "0.5"], expect="That's 0.31 miles.", match="last_line",
           hint="Amounts can have a decimal point. Which conversion reads 0.5?"),
    output("Two and a half indoor laps", inputs=["3", "2.5", "yes"], expect="That's 0.50 km.", match="last_line"),
    output("Standing still", inputs=["2", "0"], expect="That's 0.00 min per mile.", match="last_line"),
    output("A 4 is not on the menu", inputs=["4", "10", "no"], expect="No such option.", match="last_line",
           hint="Anything that isn't 1, 2 or 3 gets No such option. An else at the end catches it."),
    output("Nor is a 0", inputs=["0", "10", "no"], expect="No such option.", match="last_line"),
]
