def night(checks):
    lines = [f"Check {n}: all well" for n in range(1, checks + 1)]
    lines += [str(n) for n in range(checks, 0, -1)]
    lines.append("Lamp lit.")
    return "\n".join(lines)


TESTS = [
    output("Three checks", inputs=["3"], expect=night(3), visible=True),
    output("Two checks", inputs=["2"], expect=night(2), visible=True),
    output("Five checks", inputs=["5"], expect=night(5)),
    output("One check", inputs=["1"], expect=night(1),
           hint="With one check: one check line, a countdown of just 1, then the lamp."),
    output("No checks", inputs=["0"], expect="Lamp lit.",
           hint="With 0 checks neither loop should run, but the lamp still gets lit."),
    output("A long winter night", inputs=["12"], expect=night(12)),
    structure("Uses a for loop", requires=["For"],
              message="The number of checks changes every night. Use a for loop so it works for any number."),
]
