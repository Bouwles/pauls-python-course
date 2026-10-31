TESTS = [
    output("This morning's errors", expect="06:12 | ERROR | printer | out of paper\n07:35 | ERROR | lights | bulb failed\n2 errors", visible=True,
           hint="The lines are right and the count is 0: the loop used the generator up before len(list(...)) got to it."),
    output("Another morning", set_vars={"log": ["01:00 | ERROR | lights | bulb failed", "01:01 | ERROR | server | disk full", "01:02 | ERROR | lights | bulb failed again"]},
           expect="01:00 | ERROR | lights | bulb failed\n01:01 | ERROR | server | disk full\n01:02 | ERROR | lights | bulb failed again\n3 errors",
           hint="Every line and the count should follow whatever is in the log."),
    output("A quiet morning", set_vars={"log": ["03:00 | INFO | lights | lights on"]}, expect="0 errors"),
]
