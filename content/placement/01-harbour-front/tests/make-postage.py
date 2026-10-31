PILE = """Aaesha: 1 parcel, £6.00
Caitlin: 2 parcels, £4.70
Yahya: 1 parcel, £1.20
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
    output("The pile by the door", expect=PILE, visible=True),
    function("A letter", call="postage", args=(0.1,), expect=1.2),
    function("Exactly 1 kg", call="postage", args=(1,), expect=1.2,
             hint="Up to 1 kg includes 1 kg itself."),
    function("Just over 1 kg", call="postage", args=(1.01,), expect=3.5),
    function("Exactly 5 kg", call="postage", args=(5,), expect=3.5),
    function("Exactly 20 kg", call="postage", args=(20,), expect=6.0,
             hint="Up to 20 kg includes 20 kg. Only heavier than that goes by courier."),
    function("Too heavy to post", call="postage", args=(20.5,), expect=None,
             hint="Over 20 kg, give back None rather than a price or a message."),
    custom("One parcel each", tally_case(["Riya: 0.5", "Yahya: 3"], {"Riya": [1.2], "Yahya": [3.5]},
                                         "Each name, with a list of one price.")),
    custom("Two parcels for Caitlin", tally_case(["Caitlin: 6", "Caitlin: 0.2"], {"Caitlin": [6.0, 1.2]},
                                             "Both of Caitlin's prices, in the order they came."),
           hint="A name seen before gets the new price added to its list, not a new list."),
    custom("Untidy labels", tally_case(["  Riya :  0.5 ", "Riya:4"], {"Riya": [1.2, 3.5]},
                                       "Spaces round the name and the weight don't count."),
           hint="Strip the spaces off the name, so Riya and Riya with a space are the same person."),
    custom("Courier parcels left out", tally_case(["Neil: 31", "Paul: 1"], {"Paul": [1.2]},
                                          "A name whose only parcel goes by courier isn't in the dictionary at all."),
           hint="Work out the price before adding the name, and skip the label if the price is None."),
    custom("An empty pile", tally_case([], {}, "No labels, an empty dictionary.")),
    output("Alphabetical, not as they came", set_vars={"parcels": ["Yahya: 2", "Aaesha: 0.5", "Paul: 7"]},
           expect="Aaesha: 1 parcel, £1.20\nPaul: 1 parcel, £6.00\nYahya: 1 parcel, £3.50\nTotal: £10.70",
           hint="Go through the names in alphabetical order: sorted() on the dictionary gives its keys in order."),
    output("Three for Caitlin", set_vars={"parcels": ["Caitlin: 1", "Caitlin: 1.5", "Caitlin: 19.9"]},
           expect="Caitlin: 3 parcels, £10.70\nTotal: £10.70"),
    output("Nothing in the pile", set_vars={"parcels": []}, expect="Nothing to post.",
           hint="With nothing to charge, print Nothing to post. and nothing else."),
    output("Only courier parcels", set_vars={"parcels": ["Neil: 40", "Paul: 25"]}, expect="Nothing to post.",
           hint="Courier parcels aren't paid for here, so a pile of only those is nothing to post."),
]
