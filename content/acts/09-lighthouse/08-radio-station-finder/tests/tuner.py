DIAL = None


def dial(ctx):
    global DIAL
    if DIAL is None:
        DIAL = [float(line) for line in ctx.files["dial.txt"].split()]
    return DIAL


def stations(ctx, *args, **kwargs):
    module = ctx.module()
    if not hasattr(module, "find_stations"):
        raise CheckFailed("There is no function called find_stations in tuner.py.")
    return module.find_stations(*args, **kwargs)


def same(what, got, want):
    if got != want:
        raise CheckFailed(what, expected=want, actual=got)


def on_the_dial(ctx):
    same("find_stations(readings) on dial.txt", stations(ctx, dial(ctx)), [96.4, 101.7])


def not_the_crackle(ctx):
    found = stations(ctx, dial(ctx))
    if 90.3 in found:
        raise CheckFailed("90.3 is the crackle: one loud reading, not a station. Look for peaks in the smoothed readings.", actual=found)


def quiet_dial(ctx):
    same("A dial of nothing but hiss", stations(ctx, [0.1] * 30), [])
    same("An empty dial", stations(ctx, []), [])


def strongest_first(ctx):
    weak, strong = [0.0] * 40, [0.0] * 40
    readings = [0.0] * 40
    for i, v in zip(range(8, 13), [0.4, 0.7, 0.8, 0.7, 0.4]):
        readings[i] = v
    for i, v in zip(range(25, 30), [0.8, 1.2, 1.4, 1.2, 0.8]):
        readings[i] = v
    same("Two stations, the louder one second on the dial", stations(ctx, readings, start=100.0, step=0.5, window=3, floor=0.3), [113.5, 105.0])


def own_floor(ctx):
    readings = [0.0] * 20
    for i, v in zip(range(8, 13), [0.2, 0.35, 0.4, 0.35, 0.2]):
        readings[i] = v
    same("A weak station with floor=0.5", stations(ctx, readings, window=3, floor=0.5), [])
    same("The same station with floor=0.3", stations(ctx, readings, window=3, floor=0.3), [89.0])


def flat_top(ctx):
    readings = [0.0, 0.0, 0.9, 0.9, 0.9, 0.0, 0.0]
    same("A station with a flat top, window=1", stations(ctx, readings, window=1, floor=0.5), [88.2])


def ends_are_not_stations(ctx):
    same("Loudest at the very start, window=1", stations(ctx, [0.9, 0.5, 0.1, 0.1], window=1, floor=0.1), [])
    same("Loudest at the very end, window=1", stations(ctx, [0.1, 0.1, 0.5, 0.9], window=1, floor=0.1), [])


def smoothing_window(ctx):
    readings = [0.1, 0.1, 0.1, 1.5, 0.1, 0.1, 0.1, 0.1, 0.1]
    same("One crackle with window=1 (no smoothing): it counts", stations(ctx, readings, window=1, floor=0.5), [88.3])
    same("The same crackle with window=5: smoothed away", stations(ctx, readings, window=5, floor=0.5), [])


TESTS = [
    custom("The two stations on the dial", on_the_dial, visible=True, hint="Smooth with window=5, then find peaks at or above 0.5 in the smoothed readings."),
    custom("The crackle at 90.3 isn't a station", not_the_crackle, visible=True),
    custom("No stations in plain hiss, or on an empty dial", quiet_dial, hint="An empty list has no inside to look at; return an empty list."),
    custom("Strongest first", strongest_first, hint="Sort the peaks by their smoothed strength, largest first, before turning them into frequencies."),
    custom("The floor is a parameter", own_floor, hint="Compare with floor, not with 0.5."),
    custom("A flat-topped station counts once", flat_top, hint="Higher than the one before, at least as high as the one after."),
    custom("The ends of the dial are never stations", ends_are_not_stations, hint="Only look from the second reading to the second last."),
    custom("window decides how much smoothing", smoothing_window, hint="Use window // 2 neighbours each side, not a fixed 2."),
]
