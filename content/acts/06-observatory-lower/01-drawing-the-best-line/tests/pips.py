TESTS = [
    output("150 square metres", expect="A house of 150 square metres: about $387,000", visible=True,
           hint="The walk learnt w for areas in hundreds of square metres. What is 150 square metres in hundreds?"),
    output("200 square metres", set_vars={"area": 200.0}, expect="A house of 200 square metres: about $563,000"),
    output("95.5 square metres", set_vars={"area": 95.5}, expect="A house of 95.5 square metres: about $195,000",
           hint="If only this fails, work the price out from area, not from 150 written in again."),
]
