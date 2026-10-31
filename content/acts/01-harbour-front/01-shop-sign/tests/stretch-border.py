BORDER = "=" * 32
TESTS = [
    output(
        "Sign with a border",
        expect=BORDER + "\nPAUL'S PYTHON COURSE\nPython, from the ground floor up\nOpen Monday to Friday, 9 till 5\nIgnore the clock. It says 3:14.\n" + BORDER,
        visible=True,
        hint="32 equals signs above and below. print(\"=\" * 32) saves counting.",
    ),
]
