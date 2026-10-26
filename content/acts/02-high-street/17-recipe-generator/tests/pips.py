TESTS = [
    output("This morning's errors", expect="06:12 | ERROR | fog-horn | no air pressure\n07:35 | ERROR | lamp | bulb failed\n2 errors", visible=True,
           hint="The lines are right and the count is 0: the loop used the generator up before len(list(...)) got to it."),
    output("Another morning", set_vars={"log": ["01:00 | ERROR | lamp | bulb failed", "01:01 | ERROR | sea-wall | gate stuck", "01:02 | ERROR | lamp | bulb failed again"]},
           expect="01:00 | ERROR | lamp | bulb failed\n01:01 | ERROR | sea-wall | gate stuck\n01:02 | ERROR | lamp | bulb failed again\n3 errors",
           hint="Every line and the count should follow whatever is in the log."),
    output("A quiet morning", set_vars={"log": ["03:00 | INFO | lamp | lamp lit"]}, expect="0 errors"),
]
