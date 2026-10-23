TESTS = [
    output("Three keepers", inputs=["25", "10", "30", "15", "22"],
           expect="Back in the sea.\nBack in the sea.\nKeepers: 3", visible=True),
    output("All tiddlers", inputs=["5", "8", "12", "19", "3"],
           expect="Back in the sea.\nBack in the sea.\nBack in the sea.\nBack in the sea.\nBack in the sea.\nKeepers: 0",
           hint="continue skips the rest of the pass, so the counting line has to come after the if, not inside it."),
    output("All keepers", inputs=["20", "21", "40", "33", "25"], expect="Keepers: 5"),
]
