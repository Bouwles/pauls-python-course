CENTRE = "Take each filter's mean off its column before working out the spread."

TESTS = [
    output("All twelve filters", expect="First three shares: [0.854 0.145 0.001]", match="numbers", tol=0.0005,
           visible=True, hint=CENTRE),
    output("The first six filters, blue end only", set_vars={"FILTERS": 6}, expect="First three shares: [0.967 0.032 0.0]",
           match="numbers", tol=0.0005, visible=True, hint=CENTRE),
    output("The first four filters", set_vars={"FILTERS": 4}, expect="First three shares: [0.987 0.013 0.0]",
           match="numbers", tol=0.0005, hint=CENTRE),
    output("The first three filters", set_vars={"FILTERS": 3}, expect="First three shares: [0.994 0.006 0.0]",
           match="numbers", tol=0.0005, hint=CENTRE),
]
