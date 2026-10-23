def none_abroad(ctx):
    m = ctx.module()
    cards = [m.Postcard("Gwen", "Bodmin", m.Stamp.SECOND), m.Postcard("Mira", "Truro", m.Stamp.FIRST)]
    got = m.count_abroad(cards)
    if got != 0:
        raise CheckFailed("Neither postcard is going abroad.", expected=0, actual=got)


def all_abroad(ctx):
    m = ctx.module()
    cards = [m.Postcard(name, "Lisbon", m.Stamp.ABROAD) for name in ("Dev", "Kat", "Sanjay")]
    got = m.count_abroad(cards)
    if got != 3:
        raise CheckFailed("All three postcards are going abroad.", expected=3, actual=got)


TESTS = [
    output("Lisbon and Bilbao", expect="2 going abroad", visible=True),
    custom("Nothing abroad today", none_abroad,
           hint="If only this fails, count only the cards whose stamp is Stamp.ABROAD."),
    custom("Three to Lisbon", all_abroad,
           hint="Compare card.stamp with Stamp.ABROAD itself."),
]
