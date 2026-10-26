TESTS = [
    output("No capitals", inputs=["harbour1987"], expect="Needs capitals and lower case.", visible=True,
           hint="A password with no capitals fails, even though it has lower case. One missing is enough."),
    output("Capitals and lower case", inputs=["Harbour1987"], expect="Letters fine.", visible=True),
    output("All capitals", inputs=["HARBOUR1987"], expect="Needs capitals and lower case.",
           hint="No lower-case letters is a failure too. Either one missing is enough."),
    output("No letters at all", inputs=["19871987"], expect="Needs capitals and lower case."),
    output("Mixed up", inputs=["mOOring-Rope"], expect="Letters fine."),
]
