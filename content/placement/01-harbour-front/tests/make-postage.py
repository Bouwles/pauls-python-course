MORNING = """Bea Hollis: 2 parcels, £4.70
Gwen: 1 parcel, £6.00
Old Tom: 1 parcel, £1.20
Total: £11.90"""


def tally_case(labels, expected, message, hint=None, visible=False):
    def check(ctx):
        module = ctx.module()
        given = list(labels)
        got = module.tally(given)
        if not isinstance(got, dict):
            raise CheckFailed("tally should give back a dictionary.", expected=repr(expected), actual=repr(got))
        if got.keys() != expected.keys():
            raise CheckFailed(message, expected=repr(expected), actual=repr(got))
        for name in expected:
            prices = got[name]
            if not isinstance(prices, list) or len(prices) != len(expected[name]) or any(
                    abs(p - e) > 1e-9 for p, e in zip(prices, expected[name])):
                raise CheckFailed(message, expected=repr(expected), actual=repr(got))
    return check


TESTS = [
    function("A 2.5 kg parcel", call="postage", args=(2.5,), expect=3.5, visible=True),
    output("The morning sack", expect=MORNING, visible=True),
    function("A letter", call="postage", args=(0.1,), expect=1.2),
    function("Exactly 1 kg", call="postage", args=(1,), expect=1.2,
             hint="Up to 1 kg includes 1 kg itself."),
    function("Just over 1 kg", call="postage", args=(1.01,), expect=3.5),
    function("Exactly 5 kg", call="postage", args=(5,), expect=3.5),
    function("Exactly 20 kg", call="postage", args=(20,), expect=6.0,
             hint="Up to 20 kg includes 20 kg. Only heavier than that is freight."),
    function("Freight", call="postage", args=(20.5,), expect=None,
             hint="Over 20 kg, give back None rather than a price or a message."),
    custom("One parcel each", tally_case(["Gwen: 0.5", "Old Tom: 3"], {"Gwen": [1.2], "Old Tom": [3.5]},
                                         "Each name, with a list of one price.")),
    custom("Two parcels for Bea", tally_case(["Bea Hollis: 6", "Bea Hollis: 0.2"], {"Bea Hollis": [6.0, 1.2]},
                                             "Both of Bea's prices, in the order they came."),
           hint="A name seen before gets the new price added to its list, not a new list."),
    custom("Untidy labels", tally_case(["  Gwen :  0.5 ", "Gwen:4"], {"Gwen": [1.2, 3.5]},
                                       "Spaces round the name and the weight don't count."),
           hint="Strip the spaces off the name, so Gwen and Gwen with a space are the same person."),
    custom("Freight left out", tally_case(["Nell Brannigan: 31", "Mira: 1"], {"Mira": [1.2]},
                                          "A name whose only parcel is freight isn't in the dictionary at all."),
           hint="Work out the price before adding the name, and skip the label if the price is None."),
    custom("An empty sack", tally_case([], {}, "No labels, an empty dictionary.")),
    output("Alphabetical, not as they came", set_vars={"parcels": ["Old Tom: 2", "Agnes Rook: 0.5", "Mira: 7"]},
           expect="Agnes Rook: 1 parcel, £1.20\nMira: 1 parcel, £6.00\nOld Tom: 1 parcel, £3.50\nTotal: £10.70",
           hint="Go through the names in alphabetical order: sorted() on the dictionary gives its keys in order."),
    output("Three for the bakery", set_vars={"parcels": ["Bea Hollis: 1", "Bea Hollis: 1.5", "Bea Hollis: 19.9"]},
           expect="Bea Hollis: 3 parcels, £10.70\nTotal: £10.70"),
    output("Nothing in the sack", set_vars={"parcels": []}, expect="Nothing to post.",
           hint="With nothing to charge, print Nothing to post. and nothing else."),
    output("Only freight", set_vars={"parcels": ["Nell Brannigan: 40", "Captain Ferro: 25"]}, expect="Nothing to post.",
           hint="Freight costs nothing at the post office, so a sack of only freight is nothing to post."),
]
