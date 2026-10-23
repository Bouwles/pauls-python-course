BORDER = "=" * 40

TESTS = [
    output("Capitals and commas", inputs=["Gull report", "BLASTED gulls. Blasted, blasted   gulls."],
           expect=BORDER + "\n" + "GULL REPORT".center(40) + "\n******* gulls. *******, ******* gulls.\n" + BORDER, visible=True),
    output("Lower case still works", inputs=["Fog", "That flipping horn."],
           expect=BORDER + "\n" + "FOG".center(40) + "\nThat ******** horn.\n" + BORDER),
]
