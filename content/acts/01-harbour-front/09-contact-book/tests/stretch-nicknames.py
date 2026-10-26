TESTS = [
    output("Tom and Bea by nickname", inputs=["Tom", "Bea", ""],
           expect="Old Tom: 01632 960412, The Lighthouse\nBea Hollis: 01632 960101, The Bakery", visible=True),
    output("Gwen has no nickname", inputs=["Gwen", ""], expect="Gwen: 01632 960388, The Drowned Anchor"),
    output("Half names still work", inputs=["okonjo", ""], expect="No contact called okonjo.\nTry: Mr Okonjo"),
]
