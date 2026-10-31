TESTS = [
    output("Undo the last one", inputs=["1", "snacks", "food", "18.4", "1", "train tickets", "travel", "60", "6", "2", "5"],
           expect="Added snacks.\nAdded train tickets.\nRemoved train tickets.\nsnacks: 18.40 (food)\n1 expense, 18.40 in all.",
           visible=True),
    output("Nothing to remove", inputs=["6", "5"], expect="Nothing to remove.\n0 expenses, 0.00 in all."),
    output("Seven is still wrong", inputs=["7", "5"], expect="Choose 1 to 6.\n0 expenses, 0.00 in all."),
]
