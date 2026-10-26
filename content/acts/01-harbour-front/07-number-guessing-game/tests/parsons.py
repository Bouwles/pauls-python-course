TESTS = [
    output("Two keepers", inputs=["25", "10", "30", "done"], expect="Back in the sea.\nKeepers: 2", visible=True, timeout=3),
    output("All tiddlers", inputs=["5", "8", "12", "done"],
           expect="Back in the sea.\nBack in the sea.\nBack in the sea.\nKeepers: 0", timeout=3,
           hint="continue skips the rest of the pass, so the counting line comes after that if, not inside it."),
    output("Done straight away", inputs=["done"], expect="Keepers: 0", timeout=3,
           hint="Check for done before turning the entry into a number, or int(\"done\") crashes."),
    output("All keepers", inputs=["20", "21", "40", "done"], expect="Keepers: 3", timeout=3),
]
