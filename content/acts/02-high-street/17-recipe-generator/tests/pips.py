TESTS = [
    output("The early errors", expect="06:12 | ERROR | brakes | overheating\n07:35 | ERROR | tyres | puncture\n2 errors", visible=True,
           hint="The lines are right and the count is 0: the loop used the generator up before len(list(...)) got to it."),
    output("Another stint", set_vars={"log": ["01:00 | ERROR | tyres | puncture", "01:01 | ERROR | fuel | pressure low", "01:02 | ERROR | tyres | puncture again"]},
           expect="01:00 | ERROR | tyres | puncture\n01:01 | ERROR | fuel | pressure low\n01:02 | ERROR | tyres | puncture again\n3 errors",
           hint="Every line and the count should follow whatever is in the log."),
    output("A quiet stint", set_vars={"log": ["03:00 | INFO | tyres | grip good"]}, expect="0 errors"),
]
