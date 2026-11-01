"""Yahya's count of the ways to seat games night's chess teams in a row."""

TEAMS = ["Rooks", "Knights", "Bishops", "Pawns", "Queens", "Kings"]
RIVALS = {("Rooks", "Knights"), ("Bishops", "Pawns"), ("Rooks", "Kings")}


def count_seatings(teams, rivals):
    """How many ways the teams can sit in a row with no rival teams side by side."""
    row = []
    seated = set()

    def seat():
        if len(row) == len(teams):
            return 1
        total = 0
        for team in teams:
            if team in seated:
                continue
            if row and ((row[-1], team) in rivals or (team, row[-1]) in rivals):
                continue
            row.append(team)
            seated.add(team)
            total = total + seat()
            row.pop()
            seated.remove(team)
        return total

    return seat()


if __name__ == "__main__":
    print(f"{count_seatings(TEAMS, RIVALS)} ways to seat the teams")
