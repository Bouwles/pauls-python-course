SIGN = "PAUL'S PYTHON COURSE\nPython, from the ground floor up\nOpen Monday to Friday, 9 till 5\nIgnore the clock. It says 3:14."


def has_comment(tree, source):
    if not any(line.strip().startswith("#") for line in source.splitlines()):
        return "Start with a comment that says what the program is for."


TESTS = [
    output("First line", expect="PAUL'S PYTHON COURSE", match="contains", visible=True,
           hint="The first line is PAUL'S PYTHON COURSE, all capitals, with the apostrophe."),
    output("The whole sign, in order", expect=SIGN, visible=True),
    structure("A comment says what it is for", check=has_comment),
]
