TESTS = [
    output("A pound sign", inputs=["1", "flour", "ingredients", "£18.40", "2", "5"],
           expect="Added flour.\nflour: 18.40 (ingredients)\n1 expense, 18.40 in all.", visible=True),
    output("Still not an amount", inputs=["1", "butter", "ingredients", "£twenty", "5"],
           expect="That's not an amount.\n0 expenses, 0.00 in all."),
    output("No pound sign still works", inputs=["1", "diesel", "van", "60", "5"],
           expect="Added diesel.\n1 expense, 60.00 in all."),
]
