FULL = ["#" * 20 for _ in range(20)]

# Sand down every other column, joined along the bottom row: one winding bank.
COMB = ["#." * 10 for _ in range(19)] + ["#" * 20]

# Four banks of different shapes. Rows of sand split by rows of water.
STRIPES = ["#" * 20 if row % 4 == 0 else "." * 20 for row in range(20)]


def leaves_chart_alone(ctx):
    module = ctx.module()
    chart = ["##.", "..#", "#.#"]
    module.bank_sizes(chart)
    if chart != ["##.", "..#", "#.#"]:
        raise CheckFailed("bank_sizes should leave the chart as it found it. Keep track of counted squares somewhere else.",
                          expected=["##.", "..#", "#.#"], actual=chart)


TESTS = [
    function("Three banks", call="bank_sizes", args=(["##..#", "#...#", "..#..", "....."],), expect=[3, 2, 1], visible=True),
    function("Corners don't join", call="bank_sizes", args=(["#.", ".#"],), expect=[1, 1], visible=True),
    function("No chart", call="bank_sizes", args=([],), expect=[],
             hint="An empty chart has no rows, so no banks. Watch for chart[0] when there's no row 0."),
    function("All water", call="bank_sizes", args=(["....", "...."],), expect=[]),
    function("One square of sand", call="bank_sizes", args=(["#"],), expect=[1]),
    function("A bank that winds back up and left", call="bank_sizes", args=(["...#", ".###", "##.."],), expect=[6],
             hint="From the first square you find, a bank can carry on up and to the left. Look in all four directions."),
    function("A snake", call="bank_sizes", args=(["#.###", "#.#.#", "###.#", "....#", "#####"],), expect=[17]),
    function("A ring with an island inside", call="bank_sizes",
             args=(["#####", "#...#", "#.#.#", "#...#", "#####"],), expect=[16, 1]),
    function("A checkerboard", call="bank_sizes", args=(["#.#.", ".#.#", "#.#.", ".#.#"],), expect=[1] * 8,
             hint="Squares that only touch at a corner are separate banks."),
    function("Biggest first", call="bank_sizes", args=(["#..##", "#....", "#..##", "....#"],), expect=[3, 3, 2]),
    function("One row", call="bank_sizes", args=(["##.###.#"],), expect=[3, 2, 1]),
    function("One column", call="bank_sizes", args=(["#", "#", ".", "#"],), expect=[2, 1]),
    custom("The chart is left as it was", leaves_chart_alone),
    function("The whole bay is sand", call="bank_sizes", args=(FULL,), expect=[400],
             hint="Mark each square as counted the moment you reach it, before you look at its neighbours, or squares get counted twice."),
    function("A comb, 20 by 20", call="bank_sizes", args=(COMB,), expect=[210]),
    function("Five stripes", call="bank_sizes", args=(STRIPES,), expect=[20] * 5),
]
