TESTS = [
    output("4.5 metres", inputs=["4.5"], expect="Length in centimetres: 450.0", visible=True),
    output("3 metres", inputs=["3"], expect="Length in centimetres: 300.0",
           hint="Whole numbers should still work, and come out with .0 like the decimals do."),
    output("2.25 metres", inputs=["2.25"], expect="Length in centimetres: 225.0"),
]
