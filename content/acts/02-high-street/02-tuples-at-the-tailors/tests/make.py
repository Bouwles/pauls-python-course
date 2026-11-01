BOOK = (
    "1. Jon Hale: chest 112, waist 98, leg 84\n"
    "2. Mae Grant: chest 96, waist 88, leg 74\n"
    "3. Ray Lowe: chest 101, waist 95, leg 79"
)
TWO_NAMES = ["Ana", "Leo"]
TWO_SIZES = [(90, 72, 76), (99, 86, 78)]

TESTS = [
    output("The kit book", expect=BOOK + "\nLongest leg: Jon Hale, 84 cm", visible=True),
    function("The book for two other players", call="print_book", args=(TWO_NAMES, TWO_SIZES),
             prints="1. Ana: chest 90, waist 72, leg 76\n2. Leo: chest 99, waist 86, leg 78", visible=True),
    function("Longest leg of two", call="longest_leg", args=(TWO_NAMES, TWO_SIZES), expect=("Leo", 78),
             hint="longest_leg gives back two things, the name and the leg, in one return: return name, leg."),
    function("Longest leg is the last of four", call="longest_leg",
             args=(["Ivy", "Ana", "Sam", "Leo"], [(94, 76, 77), (90, 72, 76), (88, 70, 79), (102, 90, 81)]),
             expect=("Leo", 81),
             hint="If only this one fails, check the loop looks at every player, the last one included."),
    function("Only one player", call="longest_leg", args=(["Leo"], [(99, 86, 78)]), expect=("Leo", 78),
             hint="With one player in the book, that player has the longest leg."),
    function("A tie goes to the first", call="longest_leg",
             args=(["Ray", "Jon"], [(101, 95, 84), (112, 98, 84)]), expect=("Ray", 84),
             hint="When two legs are equal, keep the first. Only swap when the new leg is longer, not when it's the same."),
    structure("Uses zip and enumerate", calls=["zip", "enumerate"],
              message="The brief asks for zip and enumerate, so the two lists stay in step without counting by hand."),
]
