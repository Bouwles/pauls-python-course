CENTRE = "Take each column's mean off before working out the spread."

TESTS = [
    output("All six kinds of goods", expect="First three shares: [0.442 0.277 0.116]", match="numbers", tol=0.0005,
           visible=True, hint=CENTRE),
    output("Milk, grocery and paper", set_vars={"GOODS": ["milk", "grocery", "detergents_paper"]},
           expect="First three shares: [0.849 0.103 0.047]", match="numbers", tol=0.0005, visible=True, hint=CENTRE),
    output("Fresh and frozen", set_vars={"GOODS": ["fresh", "frozen"]}, expect="First three shares: [0.703 0.297]",
           match="numbers", tol=0.0005, hint=CENTRE),
    output("Four kinds", set_vars={"GOODS": ["fresh", "milk", "grocery", "frozen"]},
           expect="First three shares: [0.451 0.323 0.181]", match="numbers", tol=0.0005, hint=CENTRE),
]
