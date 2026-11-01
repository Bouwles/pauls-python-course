import itertools as _itertools

TEAMS = ["Rooks", "Knights", "Bishops", "Pawns", "Queens", "Kings"]
RIVALS = {("Rooks", "Knights"), ("Bishops", "Pawns"), ("Rooks", "Kings")}


def true_count(teams, rivals):
    return sum(
        all((one, other) not in rivals and (other, one) not in rivals for one, other in zip(row, row[1:]))
        for row in _itertools.permutations(teams)
    )


def counts(teams, rivals, message):
    def check(ctx):
        module = ctx.module()
        got = module.count_seatings(list(teams), set(rivals))
        expected = true_count(teams, rivals)
        if got != expected:
            raise CheckFailed(message, expected=expected, actual=got)
    return check


TESTS = [
    function("Six teams for games night", call="count_seatings", args=(TEAMS, RIVALS), expect=216, visible=True),
    custom("Three teams, no rivals", counts(["Bishops", "Pawns", "Knights"], set(), "With no rivals, three teams can sit in 3 x 2 x 1 = 6 orders."),
           visible=True, hint="After a team has been tried at a table, it has to be free to sit somewhere else in the next seating."),
    custom("Four teams, two rivalries", counts(TEAMS[:4], {("Rooks", "Knights"), ("Bishops", "Pawns")}, "Four teams with two rivalries can sit 8 ways.")),
    custom("Everyone a rival", counts(["Rooks", "Knights", "Bishops"], {("Rooks", "Knights"), ("Knights", "Bishops"), ("Bishops", "Rooks")},
                                    "Three teams who are all rivals can't be seated at all.")),
    custom("One team", counts(["Queens"], set(), "One team, one way.")),
    custom("Five teams, one rivalry", counts(TEAMS[1:], {("Queens", "Kings")}, "Five teams with one rivalry can sit 72 ways.")),
]
