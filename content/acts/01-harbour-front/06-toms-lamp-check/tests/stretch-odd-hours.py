TESTS = [
    output("Seven hours", inputs=["7"],
           expect="Check 1: all well\nCheck 3: all well\nCheck 5: all well\nCheck 7: all well", visible=True),
    output("Six hours", inputs=["6"], expect="Check 1: all well\nCheck 3: all well\nCheck 5: all well", visible=True),
    output("One hour", inputs=["1"], expect="Check 1: all well"),
]
