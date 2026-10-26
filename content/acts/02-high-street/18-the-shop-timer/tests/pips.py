def ticking(*readings):
    remaining = list(readings)

    def clock():
        if not remaining:
            raise CheckFailed("clock() was read more often than expected: once before the call, once after.")
        return remaining.pop(0)
    return clock


def still_logs(ctx):
    mod = ctx.module()
    mod.clock = ticking(5.0, 5.25)
    mod.log.clear()
    mod.weigh(1, 1.0)
    if mod.log != [("weigh", 0.25)]:
        raise CheckFailed("One call to weigh should still log one entry, with how long it took.", expected="[('weigh', 0.25)]", actual=repr(mod.log))


TESTS = [
    output("Plums on the label", expect="Plums: £3.15\n2 calls logged", visible=True,
           hint="weigh gives label a None. The wrapper calls the real weigh; does it hand the answer back?"),
    function("weigh still weighs", call="weigh", args=(2, 0.90), expect=1.8,
             hint="Calling weigh runs the wrapper now, so the wrapper has to return what the real weigh gave it."),
    custom("The log still logs", still_logs,
           hint="Returning straight away skips the log. Keep the result, append to the log, then return it."),
]
