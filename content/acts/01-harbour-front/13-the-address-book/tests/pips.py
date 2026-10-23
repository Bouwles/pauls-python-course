TESTS = [
    output("A name that isn't there", inputs=["Captain Ferro", ""], expect="No address for Captain Ferro.", visible=True,
           hint="book[name] crashes when name isn't a key. book.get(name, \"\") doesn't."),
    output("Two known names", inputs=["Old Tom", "Bea Hollis", ""],
           expect="Old Tom: The Lighthouse, Point Road\nBea Hollis: The Bakery, Quay Row", visible=True),
    output("Known, unknown, known", inputs=["Agnes Rook", "Mrs Vance", "Old Tom", ""],
           expect="Agnes Rook: Harbour Office, North Quay\nNo address for Mrs Vance.\nOld Tom: The Lighthouse, Point Road",
           hint="After a missing name, the loop should carry on asking."),
]
