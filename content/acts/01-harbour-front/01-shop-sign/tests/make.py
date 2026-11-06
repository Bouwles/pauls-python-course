SIGN = "PAUL'S PYTHON COURSE\nPython, from the ground floor up\nOpen Monday to Friday, 9 till 5\nIgnore the clock. It says 3:14."

# Paul's three steps are already in the starter as comments; the learner's own comment is extra.
STEPS = {
    "say what the program is for",
    "print each line of the sign, top to bottom",
    "use the other kind of quotes when the text contains quotes",
}


def has_comment(tree, source):
    comments = [line.strip().lstrip("#").strip() for line in source.splitlines() if line.strip().startswith("#")]
    if not any(c and c.lower().rstrip(".") not in STEPS for c in comments):
        return "Under the first step, add a comment of your own saying what the program is for."


TESTS = [
    output("First line", expect="PAUL'S PYTHON COURSE", match="contains", visible=True,
           hint="The first line is PAUL'S PYTHON COURSE, all capitals, with the apostrophe."),
    output("The whole sign, in order", expect=SIGN, visible=True),
    structure("A comment of your own says what it is for", check=has_comment),
]
