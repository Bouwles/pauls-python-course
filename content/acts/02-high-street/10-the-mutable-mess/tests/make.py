import copy as _copy


def standing():
    return {"Paul": {"bread": 3, "buns": 4}, "The Studio": {"bread": 6, "lardy cake": 2}}


def extras():
    return {"Paul": {"buns": 2}, "Yahya": {"lardy cake": 1}}


SATURDAY = {
    "Paul": {"bread": 3, "buns": 6},
    "The Studio": {"bread": 6, "lardy cake": 2},
    "Yahya": {"lardy cake": 1},
}


def orders_fn(ctx):
    m = ctx.module()
    if not hasattr(m, "saturday_orders"):
        raise CheckFailed("There is no function called saturday_orders.")
    return m.saturday_orders


def standing_unchanged(ctx):
    fn = orders_fn(ctx)
    book = standing()
    fn(book, extras())
    if book != standing():
        raise CheckFailed("The standing orders changed. Saturday's extras ended up in the standing book.",
                          expected=standing(), actual=_copy.deepcopy(book))


def other_customers(ctx):
    fn = orders_fn(ctx)
    result = fn({"Aaesha": {"bread": 10}, "Caitlin": {"buns": 1}}, {"Caitlin": {"buns": 2, "bread": 1}})
    want = {"Aaesha": {"bread": 10}, "Caitlin": {"buns": 3, "bread": 1}}
    if result != want:
        raise CheckFailed("Aaesha and Caitlin's Saturday is wrong.", expected=want, actual=result)


def no_extras(ctx):
    fn = orders_fn(ctx)
    book = standing()
    result = fn(book, {})
    if result != standing():
        raise CheckFailed("With no extras, Saturday's orders are just the standing orders.", expected=standing(), actual=result)
    if result is book or any(result[c] is book[c] for c in book):
        raise CheckFailed("With no extras, it handed back the standing book itself, or its inner dictionaries.")


def later_change(ctx):
    fn = orders_fn(ctx)
    book = standing()
    result = fn(book, extras())
    result["The Studio"]["bread"] = 99
    if book["The Studio"]["bread"] != 6:
        raise CheckFailed("Changing Saturday's order for the Studio changed the standing order too.",
                          expected=6, actual=book["The Studio"]["bread"])


def extras_unchanged(ctx):
    fn = orders_fn(ctx)
    week = extras()
    result = fn(standing(), week)
    if week != extras():
        raise CheckFailed("The extras changed.", expected=extras(), actual=_copy.deepcopy(week))
    result["Yahya"]["lardy cake"] = 5
    if week["Yahya"]["lardy cake"] != 1:
        raise CheckFailed("Saturday's order for Yahya is the very dictionary from the extras. Changing one changes both.")


def extras_only(ctx):
    fn = orders_fn(ctx)
    result = fn({"Paul": {"bread": 3}}, {"Riya": {"bread": 1, "buns": 2}})
    want = {"Paul": {"bread": 3}, "Riya": {"bread": 1, "buns": 2}}
    if result != want:
        raise CheckFailed("A customer who only ordered extras should still be in Saturday's orders.", expected=want, actual=result)


TESTS = [
    function("Saturday's orders", call="saturday_orders", args=(standing(), extras()), expect=SATURDAY, visible=True),
    custom("The standing orders don't change", standing_unchanged, visible=True),
    custom("Aaesha and Caitlin", other_customers,
           hint="If only this fails, add each extra to the number already there, rather than putting it in its place."),
    custom("A customer with only extras", extras_only,
           hint="If only this fails, make an empty order for a customer who isn't in the standing book yet."),
    custom("No extras this week", no_extras,
           hint="Even with no extras, hand back a copy, inner dictionaries included."),
    custom("Changing Saturday later leaves the standing orders alone", later_change,
           hint="If only this fails, the copy is shallow: Saturday's inner dictionaries are still the standing ones."),
    custom("The extras don't change either", extras_unchanged,
           hint="If only this fails, a new customer's order should be a new dictionary, not the one from the extras."),
]
