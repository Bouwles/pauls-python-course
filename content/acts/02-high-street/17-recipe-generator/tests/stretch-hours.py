ENTRIES = [("06:12", "ERROR", "printer", "out of paper"), ("06:37", "ERROR", "printer", "out of paper"),
           ("07:57", "ERROR", "printer", "out of paper"), ("06:59", "ERROR", "lights", "bulb failed")]


def as_list(ctx):
    m = ctx.module()
    got = m.by_hour(iter(ENTRIES))
    if got != {"06": 3, "07": 1} or list(got) != ["06", "07"]:
        raise CheckFailed("Count the entries in each hour, in the order the hours turned up.", expected="{'06': 3, '07': 1}", actual=repr(got))


TESTS = [
    custom("Errors by the hour", as_list, visible=True),
    function("Nothing at all", call="by_hour", args=([],), expect={}),
]
