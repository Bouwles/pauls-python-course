TESTS = [
    output("Tom and Bea by nickname", inputs=["Tom", "Bea", "Old Tom", ""],
           expect="Old Tom: The Lighthouse, Point Road\nBea Hollis: The Bakery, Quay Row\nOld Tom: The Lighthouse, Point Road\n"
                  "Round:\nBea Hollis, The Bakery, Quay Row: 1\nOld Tom, The Lighthouse, Point Road: 2", visible=True),
    output("Gwen has no nickname", inputs=["Gwen", ""],
           expect="Gwen: The Drowned Anchor, Quay Row\nRound:\nGwen, The Drowned Anchor, Quay Row: 1"),
]
