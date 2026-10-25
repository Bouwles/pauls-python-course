"""Pip's count of the ways to seat Gwen's quiz teams in a row."""

TEAMS = ["Committee", "Spanners", "Crusts", "Ledgers", "Lamplighters", "Tide Tables"]
FEUDS = {("Committee", "Spanners"), ("Crusts", "Ledgers"), ("Committee", "Tide Tables")}


def count_seatings(teams, feuds):
    """How many ways the teams can sit in a row with no feuding teams side by side."""
    row = []
    seated = set()

    def seat():
        if len(row) == len(teams):
            return 1
        total = 0
        for team in teams:
            if team in seated:
                continue
            if row and ((row[-1], team) in feuds or (team, row[-1]) in feuds):
                continue
            row.append(team)
            seated.add(team)
            total = total + seat()
            row.pop()
        return total

    return seat()


if __name__ == "__main__":
    print(f"{count_seatings(TEAMS, FEUDS)} ways to seat the teams")
