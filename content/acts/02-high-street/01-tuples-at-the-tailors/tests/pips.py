TESTS = [
    output("Mr Okonjo's three clients", expect="Chests run from 96 to 112 cm.", visible=True,
           hint="A function stops at its first return. Give back both values in one return, separated by a comma."),
    function("Two other clients", call="chest_range", args=([(90, 72, 76), (99, 86, 78)],), expect=(90, 99)),
    function("One client", call="chest_range", args=([(104, 90, 80)],), expect=(104, 104),
             hint="With one client, the smallest and the largest chest are the same number."),
]
