def run_tally(changes, undos):
    def check(ctx):
        module = ctx.module()
        tally = module.Tally()
        for paint, count in changes:
            tally.add(paint, count)
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


TALLY_DAY = [("cadmium-yellow", 4), ("ultramarine", 2), ("cadmium-yellow", 40)]

TESTS = [
    output("Forty tubes of yellow, undone", expect="{'cadmium-yellow': 4, 'ultramarine': 2}", visible=True,
           hint="Undo should take back the latest change, the forty, not the first."),
    custom("Undo twice", expect_counts(TALLY_DAY, 2, {"cadmium-yellow": 4, "ultramarine": 0},
                                       "Two undos take back the forty yellows, then the two blues."), visible=True),
    custom("Undo everything", expect_counts(TALLY_DAY, 3, {"cadmium-yellow": 0, "ultramarine": 0},
                                            "Three undos take back all three changes.")),
    custom("Undo with nothing to undo", expect_counts([], 1, {}, "With no changes, undo does nothing."),
           hint="An empty history means there's nothing to take back. Riya's check for that is fine."),
    custom("One undo too many", expect_counts([("titanium-white", 5)], 2, {"titanium-white": 0},
                                              "The first undo takes back the whites; the second has nothing to do.")),
    custom("Different paints, newest first", expect_counts([("crimson", 1), ("ochre", 7), ("indigo", 2)], 1,
                                                          {"crimson": 1, "ochre": 7, "indigo": 0},
                                                          "One undo takes back the indigo, the latest change.")),
]
