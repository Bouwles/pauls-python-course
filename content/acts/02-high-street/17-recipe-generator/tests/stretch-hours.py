ENTRIES = [("06:12", "ERROR", "fog-horn", "no air pressure"), ("06:37", "ERROR", "fog-horn", "no air pressure"),
           ("07:57", "ERROR", "fog-horn", "no air pressure"), ("06:59", "ERROR", "lamp", "bulb failed")]


def as_list(ctx):
    m = ctx.module()
    got = m.by_hour(iter(ENTRIES))
    if got != {"06": 3, "07": 1} or list(got) != ["06", "07"]:
        raise CheckFailed("Count the entries in each hour, in the order the hours turned up.", expected="{'06': 3, '07': 1}", actual=repr(got))


TESTS = [
    custom("Errors by the hour", as_list, visible=True),
    function("Nothing at all", call="by_hour", args=([],), expect={}),
]
