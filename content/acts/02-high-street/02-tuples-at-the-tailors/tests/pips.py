TESTS = [
    output("The tailor's three customers", expect="Chests run from 96 to 112 cm.", visible=True,
           hint="A function stops at its first return. Give back both values in one return, separated by a comma."),
    function("Two other customers", call="chest_range", args=([(90, 72, 76), (99, 86, 78)],), expect=(90, 99)),
    function("One customer", call="chest_range", args=([(104, 90, 80)],), expect=(104, 104),
             hint="With one customer, the smallest and the largest chest are the same number."),
]
