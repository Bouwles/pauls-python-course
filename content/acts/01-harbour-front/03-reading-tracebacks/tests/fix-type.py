TESTS = [
    output("March 14", expect="Launch day, March 14", visible=True),
    output("Another day", set_vars={"day": 3}, expect="Launch day, March 3",
           hint="If only this one fails, the date may be typed into the text instead of coming from day."),
]
