TESTS = [
    output("A name that isn't there", inputs=["Yahya", ""], expect="No number for Yahya.", visible=True,
           hint="phones[name] crashes when name isn't a key. phones.get(name, \"\") doesn't."),
    output("Two known names", inputs=["Caitlin", "Paul", ""],
           expect="Caitlin: 01632 960412\nPaul: 01632 960101", visible=True),
    output("Known, unknown, known", inputs=["Neil", "Kettle", "Caitlin", ""],
           expect="Neil: 01632 960245\nNo number for Kettle.\nCaitlin: 01632 960412",
           hint="After a missing name, the loop should carry on asking."),
]
