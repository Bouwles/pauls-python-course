SMALL = [("figs", 90, 3), ("dates", 120, 0), ("limes", 30, 40)]

TESTS = [
    output("Sanjay's Monday", expect="APPLES 45p\nPEARS 60p\nLEEKS sold out\nPLUMS 25p\nKALE 150p\nReorder: kale, leeks, pears",
           visible=True),
    function("Labels for three other items", call="labels", args=(SMALL,), expect=["FIGS 90p", "DATES sold out", "LIMES 30p"],
             visible=True),
    function("Reorder from three", call="reorder", args=(SMALL,), expect={"figs", "dates"}),
    function("reorder gives back a set", call="reorder", args=([("figs", 90, 1)],), returns_type=set, expect={"figs"},
             hint="Curly brackets round a comprehension, with no colon, make a set."),
    function("Exactly ten is enough", call="reorder", args=([("swedes", 70, 10), ("figs", 90, 9)],), expect={"figs"},
             hint="Fewer than 10 means 9 or less. An item with exactly 10 left doesn't need ordering."),
    function("Price book for three", call="price_book", args=(SMALL,), expect={"figs": 90, "limes": 30},
             hint="The price book only has items that are in the shop. The dates have sold out, so they're not in it."),
    function("No stock, no labels", call="labels", args=([],), expect=[]),
    function("No stock, empty price book", call="price_book", args=([],), expect={},
             hint="With an empty stock list, price_book should give back an empty dictionary."),
    structure("One of each kind of comprehension", requires=["ListComp", "SetComp", "DictComp"],
              message="Sanjay's three functions want one comprehension each: a list, a set and a dictionary."),
]
