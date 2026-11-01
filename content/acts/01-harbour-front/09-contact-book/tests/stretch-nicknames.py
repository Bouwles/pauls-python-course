TESTS = [
    output("Prof and Prints by nickname", inputs=["Prof", "Prints", ""],
           expect="Paul: 01632 960101, The Workshop\nPrint Shop: 01632 960530, Mill Street", visible=True),
    output("Caitlin has no nickname", inputs=["Caitlin", ""], expect="Caitlin: 01632 960412, The Studio"),
    output("Half names still work", inputs=["frame", ""], expect="No contact called frame.\nTry: Frame Shop"),
]
