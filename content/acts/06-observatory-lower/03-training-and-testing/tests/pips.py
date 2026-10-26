TESTS = [
    output("A student with 12 after the first term", expect="Predicted final grade: 12.3 out of 20", visible=True,
           hint="Scale the new student with the means and spreads of all the students, and only theirs."),
    output("A struggling student", set_vars={"NEW_STUDENT": [8, 1, 2, 4, 10]},
           expect="Predicted final grade: 8.4 out of 20", visible=True),
    output("A strong student", set_vars={"NEW_STUDENT": [16, 3, 0, 2, 0]},
           expect="Predicted final grade: 16.0 out of 20",
           hint="If only this fails, check nothing about the new student goes into the means and spreads: they belong to the students the model learnt from."),
]
