CLOSED = "Logbook closed."
NOT_AN_OPTION = "Not an option. Choose 1 to 4."


def day(*steps):
    """Each step is a choice and, for 1 and 2, the boat typed."""
    inputs = []
    for step in steps:
        inputs.extend(step.split("|"))
    return inputs


TESTS = [
    output("Out, in, report, quit",
           inputs=day("1|kittiwake", "1| mary rose", "2|Kittiwake", "3", "4"),
           expect="Kittiwake logged out.\nMary Rose logged out.\nKittiwake logged in.\n"
                  "Out: Mary Rose\nKittiwake: 1 trip\nStill out: Mary Rose\n" + CLOSED,
           visible=True),
    output("A wrong number, then quit", inputs=["7", "4"], expect=NOT_AN_OPTION + "\n" + CLOSED, visible=True),
    output("A quiet day", inputs=["3", "4"], expect="Out: none\nNo trips yet.\n" + CLOSED,
           hint="With nothing out and nothing back, the report says Out: none and No trips yet."),
    output("The same boat out twice", inputs=day("1|Sea Holly", "1|sea holly", "4"),
           expect="Sea Holly logged out.\nSea Holly is already out.\nStill out: Sea Holly\n" + CLOSED,
           hint="Tidy the name before checking it: sea holly and Sea Holly are the same boat."),
    output("In without going out", inputs=day("2|Kittiwake", "4"), expect="Kittiwake isn't out.\n" + CLOSED,
           hint="A boat that isn't out can't come in. Check first; .remove() crashes if it isn't there."),
    output("Blank names", inputs=day("1|", "2|   ", "4"), expect="A boat needs a name.\nA boat needs a name.\n" + CLOSED,
           hint="A name that is empty once it's stripped gets A boat needs a name., for 1 and for 2."),
    output("Back out after coming in", inputs=day("1|Kittiwake", "2|Kittiwake", "1|Kittiwake", "3", "4"),
           expect="Kittiwake logged out.\nKittiwake logged in.\nKittiwake logged out.\n"
                  "Out: Kittiwake\nKittiwake: 1 trip\nStill out: Kittiwake\n" + CLOSED,
           hint="A boat that has come back in can go out again, and keeps its trips."),
    output("Three trips and one",
           inputs=day("1|Kittiwake", "2|Kittiwake", "1|Sea Holly", "1|Kittiwake", "2|Kittiwake",
                      "2|Sea Holly", "1|Kittiwake", "2|Kittiwake", "3", "4"),
           expect="Kittiwake logged out.\nKittiwake logged in.\nSea Holly logged out.\nKittiwake logged out.\n"
                  "Kittiwake logged in.\nSea Holly logged in.\nKittiwake logged out.\nKittiwake logged in.\n"
                  "Out: none\nKittiwake: 3 trips\nSea Holly: 1 trip\n" + CLOSED,
           hint="One trip is 1 trip. Any other number is trips."),
    output("Alphabetical, whatever the order",
           inputs=day("1|sea holly", "1|kittiwake", "1|mary rose", "3", "2|sea holly", "2|kittiwake", "3", "4"),
           expect="Sea Holly logged out.\nKittiwake logged out.\nMary Rose logged out.\n"
                  "Out: Kittiwake, Mary Rose, Sea Holly\nNo trips yet.\n"
                  "Sea Holly logged in.\nKittiwake logged in.\n"
                  "Out: Mary Rose\nKittiwake: 1 trip\nSea Holly: 1 trip\n"
                  "Still out: Mary Rose\n" + CLOSED,
           hint="Both parts of the report are alphabetical, whatever order the boats moved in."),
    output("Wrong choices of every kind", inputs=["", "x", "0", "12", "4"],
           expect="\n".join([NOT_AN_OPTION] * 4) + "\n" + CLOSED,
           hint="Anything that isn't 1, 2, 3 or 4 gets the same reply: blank lines and letters too."),
    output("Quit with three boats out", inputs=day("1|st ives lass", "1|Lugger", "1|Ann Marie", "4"),
           expect="St Ives Lass logged out.\nLugger logged out.\nAnn Marie logged out.\n"
                  "Still out: Ann Marie, Lugger, St Ives Lass\n" + CLOSED,
           hint="Still out lists every boat that's out, alphabetically, with a comma and a space between."),
    output("A long day, nothing lost",
           inputs=day("1|Kittiwake", "1|Mary Rose", "5", "1|Sea Holly", "2|Mary Rose", "2|Lugger", "1|Lugger",
                      "3", "2|Kittiwake", "1|", "1|mary rose", "2|Sea Holly", "1|Kittiwake", "3", "4"),
           expect="Kittiwake logged out.\nMary Rose logged out.\n" + NOT_AN_OPTION + "\nSea Holly logged out.\n"
                  "Mary Rose logged in.\nLugger isn't out.\nLugger logged out.\n"
                  "Out: Kittiwake, Lugger, Sea Holly\nMary Rose: 1 trip\n"
                  "Kittiwake logged in.\nA boat needs a name.\nMary Rose logged out.\nSea Holly logged in.\n"
                  "Kittiwake logged out.\n"
                  "Out: Kittiwake, Lugger, Mary Rose\nKittiwake: 1 trip\nMary Rose: 1 trip\nSea Holly: 1 trip\n"
                  "Still out: Kittiwake, Lugger, Mary Rose\n" + CLOSED,
           hint="Follow the day through by hand, one choice at a time, and find the first line that differs."),
]
