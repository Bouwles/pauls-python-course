def verdict(*reasons):
    """The reasons in order, then the verdict line."""
    return "\n".join(list(reasons) + ["Password rejected." if reasons else "Password accepted."])


SHORT = "Too short: at least 10 characters."
CASE = "Needs capitals and lower case."
SYMBOL = "Needs a number or a symbol."
NAME = "Contains your username."
WORD = "Contains the word password."
YEAR = "Ends in a year."

TESTS = [
    output("Paul's test password", inputs=["paul", "Clock0314"], expect=verdict(SHORT, YEAR), visible=True),
    output("A good one", inputs=["aaesha", "Magic-Number-Seven"], expect=verdict(), visible=True),
    output("Only letters", inputs=["neil", "Rubberducks"], expect=verdict(SYMBOL)),
    output("No capitals", inputs=["riya", "pastel-and-ink"], expect=verdict(CASE)),
    output("All capitals", inputs=["yahya", "CLEAN-DATA-9"], expect=verdict(CASE),
           hint="No lower-case letters fails rule 2 as well. It needs both kinds."),
    output("Username in capitals, with spaces round it", inputs=["  Caitlin ", "Arcade-CAITLIN-hi"], expect=verdict(NAME),
           hint="Strip the username and put it in lower case, then look for it in a lower-case copy of the password."),
    output("Password written with a zero", inputs=["neil", "Passw0rd-Rocket"], expect=verdict(WORD),
           hint="Swap 0 for o in a lower-case copy of the password before you look for the word password."),
    output("PASSWORD in capitals", inputs=["riya", "MyPASSWORDisSafe1"], expect=verdict(WORD),
           hint="Look for the word in a lower-case copy of the password, so capitals don't hide it."),
    output("A year on the end", inputs=["paul", "Workshop-Chalk-2019"], expect=verdict(YEAR),
           hint="The last four characters are password[-4:]. Are they all digits?"),
    output("Two digits on the end is fine", inputs=["aaesha", "Engine-Room-42"], expect=verdict(),
           hint="Only four digits on the end counts as a year. The last four here are m-42."),
    output("Exactly 10 characters", inputs=["yahya", "Puzzle-Box"], expect=verdict(),
           hint="Ten characters is enough. Only fewer than 10 is too short."),
    output("Nine characters", inputs=["caitlin", "Arcade-99"], expect=verdict(SHORT)),
    output("Five rules at once", inputs=["word", "password"], expect=verdict(SHORT, CASE, SYMBOL, NAME, WORD),
           hint="Every rule gets its own if, and every reason is printed. elif would stop at the first one."),
]
