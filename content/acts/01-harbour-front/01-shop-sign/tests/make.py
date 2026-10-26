SIGN = "MOSS'S WORKSHOP\nRepairs of all kinds\nOpen Tuesday to Saturday, 9 till 5\nClosed when the radio is on"


def has_comment(tree, source):
    if not any(line.strip().startswith("#") for line in source.splitlines()):
        return "Start with a comment that says what the program is for."


TESTS = [
    output("First line", expect="MOSS'S WORKSHOP", match="contains", visible=True,
           hint="The first line is MOSS'S WORKSHOP, all capitals, with the apostrophe."),
    output("The whole sign, in order", expect=SIGN, visible=True),
    structure("A comment says what it is for", check=has_comment),
]
