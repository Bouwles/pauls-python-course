"""Library fines, in pence. Mrs Vance's rules, written down at last."""

GRACE_DAYS = 2   # up to two days late is forgiven
PER_DAY = 10     # pence for every day late, once it's past the grace
CAP = 300        # nobody pays more than three pounds for one book


def fine(days_late, childrens=False):
    """The fine in pence for one book. Children's books are half, after the cap."""
    if days_late < 0:
        raise ValueError("A book can't come back before it went out.")
    if days_late <= GRACE_DAYS:
        return 0
    pence = min(days_late * PER_DAY, CAP)
    if childrens:
        pence = pence // 2
    return pence
