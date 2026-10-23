TESTS = [
    output("Kittiwake works hardest",
           inputs=["1", "Kittiwake", "2", "Kittiwake", "1", "Sea Holly", "2", "Sea Holly", "1", "Kittiwake", "2", "Kittiwake", "3", "4"],
           expect="Kittiwake logged out.\nKittiwake logged in.\nSea Holly logged out.\nSea Holly logged in.\n"
                  "Kittiwake logged out.\nKittiwake logged in.\n"
                  "Out: none\nKittiwake: 2 trips\nSea Holly: 1 trip\nBusiest: Kittiwake (2 trips)\nLogbook closed.", visible=True),
    output("A tie goes to the alphabet",
           inputs=["1", "Sea Holly", "2", "Sea Holly", "1", "Lugger", "2", "Lugger", "3", "4"],
           expect="Sea Holly logged out.\nSea Holly logged in.\nLugger logged out.\nLugger logged in.\n"
                  "Out: none\nLugger: 1 trip\nSea Holly: 1 trip\nBusiest: Lugger (1 trip)\nLogbook closed."),
    output("No trips, no busiest", inputs=["3", "4"], expect="Out: none\nNo trips yet.\nLogbook closed."),
]
