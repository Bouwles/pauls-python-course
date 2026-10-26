BOOK = (
    "1. Captain Ferro: chest 112, waist 98, leg 84\n"
    "2. Bea Hollis: chest 96, waist 88, leg 74\n"
    "3. Old Tom: chest 101, waist 95, leg 79"
)
TWO_NAMES = ["Mira", "Gwen"]
TWO_SIZES = [(90, 72, 76), (99, 86, 78)]

TESTS = [
    output("Mr Okonjo's book", expect=BOOK + "\nLongest leg: Captain Ferro, 84 cm", visible=True),
    function("The book for two other clients", call="print_book", args=(TWO_NAMES, TWO_SIZES),
             prints="1. Mira: chest 90, waist 72, leg 76\n2. Gwen: chest 99, waist 86, leg 78", visible=True),
    function("Longest leg of two", call="longest_leg", args=(TWO_NAMES, TWO_SIZES), expect=("Gwen", 78),
             hint="longest_leg gives back two things, the name and the leg, in one return: return name, leg."),
    function("Longest leg is the last of four", call="longest_leg",
             args=(["Agnes", "Mira", "Kat", "Dev"], [(94, 76, 77), (90, 72, 76), (88, 70, 79), (102, 90, 81)]),
             expect=("Dev", 81),
             hint="If only this one fails, check the loop looks at every client, the last one included."),
    function("Only one client", call="longest_leg", args=(["Gwen"], [(99, 86, 78)]), expect=("Gwen", 78),
             hint="With one client in the book, that client has the longest leg."),
    function("A tie goes to the first", call="longest_leg",
             args=(["Tom", "Ferro"], [(101, 95, 84), (112, 98, 84)]), expect=("Tom", 84),
             hint="When two legs are equal, keep the first. Only swap when the new leg is longer, not when it's the same."),
    structure("Uses zip and enumerate", calls=["zip", "enumerate"],
              message="Mr Okonjo asked for zip and enumerate, so the two lists stay in step without counting by hand."),
]
