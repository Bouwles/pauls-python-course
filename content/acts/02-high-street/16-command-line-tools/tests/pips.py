TESTS = [
    output("Ferro's hours", argv=["Ferro"], expect="Ferro: 7.0 hours", exit_code=0, visible=True,
           hint="sys.argv[0] is the program's own name. The customer is the next one along."),
    output("Gwen has no jobs", argv=["Gwen"], expect="No jobs for Gwen.", exit_code=1, visible=True,
           hint="Finishing with 0 tells whoever started it that all went well. No jobs isn't all well: exit with 1."),
    output("Mira's hours", argv=["Mira"], expect="Mira: 2.0 hours", exit_code=0,
           hint="Every customer should work, not just Ferro. Is a name typed into the code?"),
]
