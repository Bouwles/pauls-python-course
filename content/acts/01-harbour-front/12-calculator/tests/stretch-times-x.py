TESTS = [
    output("Six x seven", inputs=["6 x 7", "quit"], expect="= 42.00\nDone for today.", visible=True),
    output("Star still works", inputs=["6 * 7", "quit"], expect="= 42.00\nDone for today."),
    function("calculate(3, \"x\", 2.5)", call="calculate", args=(3.0, "x", 2.5), expect=7.5),
]
