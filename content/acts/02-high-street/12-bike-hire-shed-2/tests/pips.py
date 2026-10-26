TESTS = [
    output("Two of the three are out", expect="2 on loan", visible=True,
           hint="book.status is a member of Status, never a string. Compare it with Status.ON_LOAN."),
]
