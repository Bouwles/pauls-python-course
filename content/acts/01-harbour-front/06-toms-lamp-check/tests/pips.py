TESTS = [
    output("Three checks", inputs=["3"], expect="Check 1: all well\nCheck 2: all well\nCheck 3: all well", visible=True),
    output("Five checks", inputs=["5"],
           expect="Check 1: all well\nCheck 2: all well\nCheck 3: all well\nCheck 4: all well\nCheck 5: all well"),
    output("One check", inputs=["1"], expect="Check 1: all well",
           hint="With one check the loop should run once. Where does the range stop?"),
]
