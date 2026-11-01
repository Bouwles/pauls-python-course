DEFAULT = (
    "Handed in: 4 different items\n"
    "Matched: black umbrella, red scarf\n"
    "Nobody has asked about: blue headphones, dice bag\n"
    "Still missing: spare controller"
)

TESTS = [
    output("The Studio's box", expect=DEFAULT, visible=True),
    function("A smaller box", call="report", args=(["hat", "hat", "glove"], ["glove", "kite"]),
             prints="Handed in: 2 different items\nMatched: glove\nNobody has asked about: hat\nStill missing: kite",
             visible=True),
    function("Nothing matches", call="report", args=(["frisbee", "flask"], ["kite"]),
             prints="Handed in: 2 different items\nMatched: none\nNobody has asked about: flask, frisbee\nStill missing: kite",
             hint="When a set is empty, its line should end with none rather than nothing at all."),
    function("Everything claimed", call="report", args=(["kite", "frisbee", "kite"], ["frisbee", "kite", "frisbee"]),
             prints="Handed in: 2 different items\nMatched: frisbee, kite\nNobody has asked about: none\nStill missing: none",
             hint="Repeats in reported count once too. Both lists need turning into sets."),
    function("An empty box", call="report", args=([], ["umbrella"]),
             prints="Handed in: 0 different items\nMatched: none\nNobody has asked about: none\nStill missing: umbrella",
             hint="An empty box still gets all four lines: 0 different items, and none wherever there's nothing."),
    function("Alphabetical order", call="report", args=(["water bottle", "beanie", "map", "beanie"], []),
             prints="Handed in: 3 different items\nMatched: none\nNobody has asked about: beanie, map, water bottle\nStill missing: none",
             hint="Sort the items before joining them, so they come out in alphabetical order every time."),
]
