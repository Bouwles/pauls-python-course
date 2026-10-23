TESTS = [
    output("From 3", inputs=["3"], expect="Stand clear of the lens.\n3\n2\n1\nLamp lit.", visible=True),
    output("From 1", inputs=["1"], expect="Stand clear of the lens.\n1\nLamp lit.",
           hint="The warning and the lamp happen once each. Only the number repeats."),
    output("From 5", inputs=["5"], expect="Stand clear of the lens.\n5\n4\n3\n2\n1\nLamp lit."),
]
