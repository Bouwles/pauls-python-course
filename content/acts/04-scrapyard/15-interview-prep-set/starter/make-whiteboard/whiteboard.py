"""Paul's whiteboard: three questions, the sort they ask at interviews."""


def pair_for(weights, target):
    """Positions (i, j), i < j, of two parts weighing target together, or None."""


def islands(grid):
    """How many separate islands of # there are in the drawing."""


def merge_piles(piles):
    """One list of every weight in piles, each already lightest first, lightest first."""


if __name__ == "__main__":
    print(pair_for([12, 7, 30, 4, 19], 23))
    print(islands(["##..#", "#...#", "..#..", "##..."]))
    print(merge_piles([[1, 4, 9], [2, 3], [5, 8, 10]]))
