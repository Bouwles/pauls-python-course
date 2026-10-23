TESTS = [
    output("The sandwich notice", inputs=["The blasted gulls took my flipping sandwich."],
           expect="The ******* gulls took my ******** sandwich.", visible=True,
           hint=".replace() hands back a new string. Keep it, or the notice never changes."),
    output("The same word twice", inputs=["That dratted fog and that dratted horn."],
           expect="That ******* fog and that ******* horn."),
    output("Nothing rude", inputs=["Tide tables in the window."], expect="Tide tables in the window."),
]
