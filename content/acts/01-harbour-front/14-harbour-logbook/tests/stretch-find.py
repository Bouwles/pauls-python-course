TESTS = [
    output("Out, in, and never seen",
           inputs=["1", "Kittiwake", "5", "kittiwake", "2", "Kittiwake", "5", "Kittiwake", "5", "Lugger", "4"],
           expect="Kittiwake logged out.\nKittiwake is out. 0 trips today.\nKittiwake logged in.\n"
                  "Kittiwake is in. 1 trip today.\nNo record of Lugger.\nLogbook closed.", visible=True),
    output("Six is not an option", inputs=["6", "4"], expect="Not an option. Choose 1 to 5.\nLogbook closed."),
]
