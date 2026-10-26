TESTS = [
    output("Undo the last one", inputs=["1", "flour", "ingredients", "18.4", "1", "diesel", "van", "60", "6", "2", "5"],
           expect="Added flour.\nAdded diesel.\nRemoved diesel.\nflour: 18.40 (ingredients)\n1 expense, 18.40 in all.",
           visible=True),
    output("Nothing to remove", inputs=["6", "5"], expect="Nothing to remove.\n0 expenses, 0.00 in all."),
    output("Seven is still wrong", inputs=["7", "5"], expect="Choose 1 to 6.\n0 expenses, 0.00 in all."),
]
