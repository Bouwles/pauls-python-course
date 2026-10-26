def standing_unchanged(ctx):
    m = ctx.module()
    standing = {"bread": 6, "lardy cake": 2}
    result = m.todays_order(standing, {"lardy cake": 1, "buns": 3})
    if standing != {"bread": 6, "lardy cake": 2}:
        raise CheckFailed("todays_order changed the standing order it was given.",
                          expected={"bread": 6, "lardy cake": 2}, actual=standing)
    if result != {"bread": 6, "lardy cake": 3, "buns": 3}:
        raise CheckFailed("Today's order should be the standing order plus the extras.",
                          expected={"bread": 6, "lardy cake": 3, "buns": 3}, actual=result)


def new_dictionary(ctx):
    m = ctx.module()
    standing = {"bread": 1}
    result = m.todays_order(standing, {})
    if result is standing:
        raise CheckFailed("With no extras, todays_order handed back the standing order itself, not a copy.")


TESTS = [
    output("This week and next", expect="This week: {'bread': 3, 'buns': 6}\nNext week: {'bread': 3, 'buns': 4}", visible=True),
    custom("Gwen's order stays as it was", standing_unchanged,
           hint="If only this fails, make the copy before the loop changes anything."),
    custom("No extras still gives a new dictionary", new_dictionary,
           hint="Even with no extras, hand back a copy. Otherwise whoever changes it changes the standing order."),
]
