RACK = [3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 30]


def every_bolt(ctx):
    module = ctx.module()
    for drawer, size in enumerate(RACK):
        got = module.find_bolt(RACK, size)
        if got != drawer:
            raise CheckFailed(f"The {size} mm bolt is in drawer {drawer}.", expected=drawer, actual=got)


TESTS = [
    function("The 10 mm", call="find_bolt", args=(RACK, 10), expect=5, visible=True),
    function("The 30 mm, in the last drawer", call="find_bolt", args=(RACK, 30), expect=10, visible=True,
             hint="Watch low and high on the last look for 30. When they're equal, there's still one drawer to open."),
    function("The 3 mm, in the first drawer", call="find_bolt", args=(RACK, 3), expect=0),
    custom("Every bolt in the rack", every_bolt,
           hint="Some bolts are only found when the search is down to one drawer. The loop has to open that one too."),
    function("A rack with one drawer", call="find_bolt", args=([8], 8), expect=0,
             hint="With one drawer, low and high start equal. The loop must still look."),
    function("No 7 mm bolt", call="find_bolt", args=(RACK, 7), expect=-1),
    function("An empty rack", call="find_bolt", args=([], 8), expect=-1),
]
