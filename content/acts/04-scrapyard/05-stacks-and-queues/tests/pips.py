def run_tally(changes, undos):
    def check(ctx):
        module = ctx.module()
        tally = module.Tally()
        for part, count in changes:
            tally.add(part, count)
        for _ in range(undos):
            tally.undo()
        return tally.counts
    return check


def expect_counts(changes, undos, expected, message):
    def check(ctx):
        got = run_tally(changes, undos)(ctx)
        if got != expected:
            raise CheckFailed(message, expected=expected, actual=got)
    return check


TALLY_DAY = [("hubcap", 4), ("bike-bell", 2), ("hubcap", 40)]

TESTS = [
    output("Forty hubcaps, undone", expect="{'hubcap': 4, 'bike-bell': 2}", visible=True,
           hint="Undo should take back the latest change, the forty, not the first."),
    custom("Undo twice", expect_counts(TALLY_DAY, 2, {"hubcap": 4, "bike-bell": 0},
                                       "Two undos take back the forty hubcaps, then the two bells."), visible=True),
    custom("Undo everything", expect_counts(TALLY_DAY, 3, {"hubcap": 0, "bike-bell": 0},
                                            "Three undos take back all three changes.")),
    custom("Undo with nothing to undo", expect_counts([], 1, {}, "With no changes, undo does nothing."),
           hint="An empty history means there's nothing to take back. Riya's check for that is fine."),
    custom("One undo too many", expect_counts([("gear-12t", 5)], 2, {"gear-12t": 0},
                                              "The first undo takes back the gears; the second has nothing to do.")),
    custom("Different parts, newest first", expect_counts([("valve", 1), ("spring", 7), ("anvil", 2)], 1,
                                                          {"valve": 1, "spring": 7, "anvil": 0},
                                                          "One undo takes back the anvils, the latest change.")),
]
