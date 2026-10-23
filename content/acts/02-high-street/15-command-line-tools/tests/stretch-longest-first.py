TESTS = [
    output("Ferro's longest job first", argv=["Ferro", "--longest"],
           expect="105 cabin door (done, 4 h)\n102 winch handle (open, 3 h)\nTotal: 7.0 h", exit_code=0, visible=True),
    output("Without the flag, ledger order", argv=["Ferro"],
           expect="102 winch handle (open, 3 h)\n105 cabin door (done, 4 h)\nTotal: 7.0 h", exit_code=0, visible=True),
    output("Bea's, longest first", argv=["Bea", "--longest"],
           expect="106 bread slicer (open, 2 h)\n101 oven door hinge (done, 1.5 h)\nTotal: 3.5 h", exit_code=0,
           hint="Sort by the hours as numbers. As text, \"2\" and \"1.5\" happen to work, but \"10\" would come before \"2\"."),
]
