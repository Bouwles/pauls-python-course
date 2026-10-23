def separate_days(ctx):
    m = ctx.module()
    m.queue_label("RADIO for Moss")
    second = m.queue_label("MIXER for Bea")
    if second != ["MIXER for Bea"]:
        raise CheckFailed("Two calls with no queue should give two separate lists.",
                          expected=["MIXER for Bea"], actual=second)


def given_queue(ctx):
    m = ctx.module()
    waiting = ["KETTLE for Bea"]
    result = m.queue_label("CLOCK for Tom", waiting)
    if result is not waiting or waiting != ["KETTLE for Bea", "CLOCK for Tom"]:
        raise CheckFailed("A queue passed in should be added to and handed back.",
                          expected=["KETTLE for Bea", "CLOCK for Tom"], actual=result)


TESTS = [
    output("Monday and Tuesday", expect="Monday: ['KETTLE for Bea']\nTuesday: ['CLOCK for Tom']", visible=True),
    custom("Two more calls, two more lists", separate_days,
           hint="If only this fails, check that a new list is made inside the function on every call without a queue."),
    custom("A queue passed in is added to", given_queue,
           hint="If only this fails, make sure the function replaces queue only when it is None."),
]
