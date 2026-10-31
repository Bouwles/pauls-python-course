TESTS = [
    output("Two on the board", inputs=["25", "10", "30", "done"], expect="Too low for the board.\nOn the board: 2", visible=True, timeout=3),
    output("All too low", inputs=["5", "8", "12", "done"],
           expect="Too low for the board.\nToo low for the board.\nToo low for the board.\nOn the board: 0", timeout=3,
           hint="continue skips the rest of the pass, so the counting line comes after that if, not inside it."),
    output("Done straight away", inputs=["done"], expect="On the board: 0", timeout=3,
           hint="Check for done before turning the entry into a number, or int(\"done\") crashes."),
    output("All on the board", inputs=["20", "21", "40", "done"], expect="On the board: 3", timeout=3),
]
