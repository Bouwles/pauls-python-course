import ast as _ast

DASHES = "-" * 24
EQUALS = "=" * 24


def fresh_queue(ctx):
    m = ctx.module()
    if not hasattr(m, "add_to_queue"):
        raise CheckFailed("There is no function called add_to_queue.")
    m.add_to_queue("KETTLE for Bea")
    second = m.add_to_queue("CLOCK for Tom")
    if second != ["CLOCK for Tom"]:
        raise CheckFailed("Two calls with no list should give two separate lists.",
                          expected=["CLOCK for Tom"], actual=second)


def given_queue(ctx):
    m = ctx.module()
    waiting = ["RADIO for Moss"]
    result = m.add_to_queue("MIXER for Bea", waiting)
    if result is not waiting or waiting != ["RADIO for Moss", "MIXER for Bea"]:
        raise CheckFailed("A list passed in should be added to and handed back.",
                          expected=["RADIO for Moss", "MIXER for Bea"], actual=result)


def docstrings(tree, source):
    missing = [n.name for n in tree.body if isinstance(n, _ast.FunctionDef) and not _ast.get_docstring(n)]
    if missing:
        return "Give " + ", ".join(missing) + " a docstring: a string on the first line inside the def."


TESTS = [
    function("Two lines, the defaults", call="label", args=("Kettle", "Bea Hollis"),
             expect=DASHES + "\nKettle\nBea Hollis\n" + DASHES, visible=True),
    function("Bea's kettle", call="tag", args=("kettle",), kwargs={"owner": "Bea", "spout": "rewelded", "handle": "new"},
             expect=EQUALS + "\nKETTLE for Bea\nspout: rewelded\nhandle: new\n" + EQUALS, visible=True),
    function("Stars, ten wide", call="label", args=("Clock", "Old Tom"), kwargs={"border": "*", "width": 10},
             expect="**********\nClock\nOld Tom\n**********",
             hint="Use the border and width you are given, not \"-\" and 24 written into the code."),
    function("A long line is cut to width", call="label", args=("Lighthouse lamp, main",), kwargs={"width": 10},
             expect="----------\nLighthouse\n----------",
             hint="If only this fails, cut each line to width with a slice: line[:width]."),
    function("No lines at all", call="label", args=(), expect=DASHES + "\n" + DASHES,
             hint="With no lines, a label is just its two borders."),
    function("A tag with no notes", call="tag", args=("radio",), expect=EQUALS + "\nRADIO for Moss\n" + EQUALS,
             hint="If only this fails, check that owner defaults to Moss and the notes loop copes with no notes."),
    function("Three notes, in order", call="tag", args=("mixer", "Bea"), kwargs={"motor": "rewound", "bowl": "dented", "paid": "yes"},
             expect=EQUALS + "\nMIXER for Bea\nmotor: rewound\nbowl: dented\npaid: yes\n" + EQUALS,
             hint="One line per note, name: value, in the order the notes were passed."),
    custom("A new queue every time", fresh_queue,
           hint="If only this fails, look at the default for waiting. A list in the def line is made once, not on every call."),
    custom("A list passed in is added to", given_queue,
           hint="If only this fails, replace waiting only when it is None."),
    structure("Every function has a docstring", check=docstrings,
              hint="A docstring is a string in triple quotes on the very first line inside the def."),
]
