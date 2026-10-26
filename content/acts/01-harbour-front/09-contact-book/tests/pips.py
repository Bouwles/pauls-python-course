TESTS = [
    output("A name that isn't there", inputs=["Captain Ferro", ""], expect="No number for Captain Ferro.", visible=True,
           hint="phones[name] crashes when name isn't a key. phones.get(name, \"\") doesn't."),
    output("Two known names", inputs=["Old Tom", "Bea Hollis", ""],
           expect="Old Tom: 01632 960412\nBea Hollis: 01632 960101", visible=True),
    output("Known, unknown, known", inputs=["Agnes Rook", "Mrs Vance", "Old Tom", ""],
           expect="Agnes Rook: 01632 960245\nNo number for Mrs Vance.\nOld Tom: 01632 960412",
           hint="After a missing name, the loop should carry on asking."),
]
