TESTS = [
    output("Yahya's hours", argv=["Yahya"], expect="Yahya: 7.0 hours", exit_code=0, visible=True,
           hint="sys.argv[0] is the program's own name. The customer is the next one along."),
    output("Aaesha has no jobs", argv=["Aaesha"], expect="No jobs for Aaesha.", exit_code=1, visible=True,
           hint="Finishing with 0 tells whoever started it that all went well. No jobs isn't all well: exit with 1."),
    output("Caitlin's hours", argv=["Caitlin"], expect="Caitlin: 2.0 hours", exit_code=0,
           hint="Every name should work, not just Yahya. Is a name typed into the code?"),
]
