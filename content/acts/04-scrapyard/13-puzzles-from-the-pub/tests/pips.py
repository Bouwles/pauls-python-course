import itertools as _itertools

TEAMS = ["Committee", "Spanners", "Crusts", "Ledgers", "Lamplighters", "Tide Tables"]
FEUDS = {("Committee", "Spanners"), ("Crusts", "Ledgers"), ("Committee", "Tide Tables")}


def true_count(teams, feuds):
    return sum(
        all((one, other) not in feuds and (other, one) not in feuds for one, other in zip(row, row[1:]))
        for row in _itertools.permutations(teams)
    )


def counts(teams, feuds, message):
    def check(ctx):
        module = ctx.module()
        got = module.count_seatings(list(teams), set(feuds))
        expected = true_count(teams, feuds)
        if got != expected:
            raise CheckFailed(message, expected=expected, actual=got)
    return check


TESTS = [
    function("Gwen's six teams", call="count_seatings", args=(TEAMS, FEUDS), expect=216, visible=True),
    custom("Three teams, no feuds", counts(["Crusts", "Ledgers", "Spanners"], set(), "With no feuds, three teams can sit in 3 x 2 x 1 = 6 orders."),
           visible=True, hint="After a team has been tried at a table, it has to be free to sit somewhere else in the next seating."),
    custom("Four teams, two feuds", counts(TEAMS[:4], {("Committee", "Spanners"), ("Crusts", "Ledgers")}, "Four teams with two feuds can sit 8 ways.")),
    custom("Nobody gets on", counts(["Committee", "Spanners", "Crusts"], {("Committee", "Spanners"), ("Spanners", "Crusts"), ("Crusts", "Committee")},
                                    "Three teams who all feud can't be seated at all.")),
    custom("One team", counts(["Lamplighters"], set(), "One team, one way.")),
    custom("Five teams, one feud", counts(TEAMS[1:], {("Lamplighters", "Tide Tables")}, "Five teams with one feud can sit 72 ways.")),
]
