RUDE = ["blasted", "flipping", "dratted"]
PARTS = ["the border above", "the title", "the notice", "the border below"]


def _board(title, notice, centre):
    title = title.strip().upper()
    if len(title) > 40:
        title = title[:37] + "..."
    notice = " ".join(notice.split())
    for word in RUDE:
        notice = notice.replace(word, "*" * len(word))
    return "\n".join(["=" * 40, centre(title), notice, "=" * 40])


def board(title, notice):
    # .center() and an f-string's :^ can differ by one space when the gap is odd; both are fine.
    def check(ctx):
        r = ctx.run_program(inputs=[title, notice])
        a = _board(title, notice, lambda t: t.center(40))
        b = _board(title, notice, lambda t: f"{t:^40}")
        if r.error is not None:
            raise CheckFailed(f"It crashed: {type(r.error).__name__}: {r.error}", expected=a, actual=r.output)
        got = norm_lines(r.output)
        if got in (norm_lines(a), norm_lines(b)):
            return
        want = norm_lines(a)
        if len(got) != len(want):
            raise CheckFailed(f"The board should be {len(want)} lines: border, title, notice, border.", expected=a, actual=r.output)
        alt = norm_lines(b)
        wrong = [i for i in range(len(want)) if got[i] != want[i] and got[i] != alt[i]]
        raise CheckFailed(f"Everything matches except {PARTS[wrong[0]]}.", expected=a, actual=r.output)
    return check


TESTS = [
    custom("A lost lobster pot", board("  lost: one lobster pot", "Blue,   with a blasted yellow rope.  Return to the harbour office."), visible=True),
    custom("Harbour closed", board("Harbour closed", "Closed Sunday for dredging. Agnes."), visible=True),
    custom("Every rude word, one twice", board("Gull report", "That blasted, flipping gull. That dratted bird. That blasted gull again.")),
    custom("Gaps everywhere", board("tide tables", "   Tide    tables   are    in   the    window.   "),
           hint="Spaces at the ends and runs of spaces in the middle: .split() then .join() deals with both."),
    custom("A long title", board("Annual general meeting of the Saltmarsh Crab Racing Club", "Blazers, please."),
           hint="Over 40 characters: keep the first 37 and add three dots, so it is exactly 40."),
    custom("A title of exactly 40", board("Crab racing postponed until further tide", "Sir Reginald is unwell."),
           hint="Exactly 40 characters fits. Only cut a title that is longer than 40."),
    custom("Spaces round the title", board("  gull warning            ", "Do not feed them."),
           hint="Strip the title before you measure or centre it, or the spaces get centred too."),
    custom("Nothing rude at all", board("Found", "One glove, left hand, by the slipway.")),
]
