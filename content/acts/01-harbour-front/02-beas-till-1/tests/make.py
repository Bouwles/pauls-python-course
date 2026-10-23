TESTS = [
    output("The Ashbys' order", expect="1060\n10 pounds 60 pence", visible=True),
    output("Five loaves, no buns", set_vars={"loaves": 5, "buns": 0}, expect="1200\n12 pounds 0 pence",
           hint="If only the changed orders fail, check the sums use loaves and buns rather than 3 and 4."),
    output("One of each", set_vars={"loaves": 1, "buns": 1}, expect="325\n3 pounds 25 pence"),
    output("Buns only", set_vars={"loaves": 0, "buns": 3}, expect="255\n2 pounds 55 pence",
           hint="If this is the only one failing, check what happens when there are no loaves."),
]
