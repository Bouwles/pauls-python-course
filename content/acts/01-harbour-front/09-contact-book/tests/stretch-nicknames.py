TESTS = [
    output("Prof and Repairs by nickname", inputs=["Prof", "Repairs", ""],
           expect="Paul: 01632 960101, The Workshop\nClock Repairs: 01632 960530, Mill Street", visible=True),
    output("Caitlin has no nickname", inputs=["Caitlin", ""], expect="Caitlin: 01632 960412, The Makerspace"),
    output("Half names still work", inputs=["parts", ""], expect="No contact called parts.\nTry: Clock Parts"),
]
