TESTS = [
    output("A pound sign", inputs=["1", "snacks", "food", "£18.40", "2", "5"],
           expect="Added snacks.\nsnacks: 18.40 (food)\n1 expense, 18.40 in all.", visible=True),
    output("Still not an amount", inputs=["1", "sandwiches", "food", "£twenty", "5"],
           expect="That's not an amount.\n0 expenses, 0.00 in all."),
    output("No pound sign still works", inputs=["1", "train tickets", "travel", "60", "5"],
           expect="Added train tickets.\n1 expense, 60.00 in all."),
]
