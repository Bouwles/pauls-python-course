TESTS = [
    output("Three batches", expect="flour: 900 g\nbutter: 600 g\nsugar: 300 g\nTotal: 1800 g", visible=True,
           hint="The list is right and the total is 0: the loop used the generator up before sum() got to it."),
    output("Two batches", set_vars={"batches": 2}, expect="flour: 600 g\nbutter: 400 g\nsugar: 200 g\nTotal: 1200 g",
           hint="If only this one fails, check the total is added up from the amounts, not typed in."),
    output("Five batches", set_vars={"batches": 5}, expect="flour: 1500 g\nbutter: 1000 g\nsugar: 500 g\nTotal: 3000 g",
           hint="Every amount and the total should follow the number of batches."),
]
