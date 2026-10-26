BORDER = "=" * 34
TESTS = [
    output(
        "Sign with a border",
        expect=BORDER + "\nMOSS'S WORKSHOP\nRepairs of all kinds\nOpen Tuesday to Saturday, 9 till 5\nClosed when the radio is on\n" + BORDER,
        visible=True,
        hint="34 equals signs above and below. print(\"=\" * 34) saves counting.",
    ),
]
