import types as _types

MACHINE = "\"\"\"The clock's controller: the face lamp, the fog lamp and the hand heaters.\n\nIt was fitted before Paul had the keys. It watched three winters of the old\nlogs and learned to run the clock face from them. These numbers are what it\nlearned. Nobody ever wrote down why.\n\"\"\"\n\nLEARNED = {\n    \"lamp\": {\"dark\": 10.0, \"visibility_km\": -1.0, \"bias\": 2.0},\n    \"fog_lamp\": {\"visibility_km\": -10.0, \"ice_mm\": -1.5, \"bias\": 8.0},\n    \"heater\": {\"ice_mm\": 6.0, \"wind\": 0.0, \"bias\": -27.6},\n}\n\n\ndef score(weights, features):\n    return weights[\"bias\"] + sum(w * features[name] for name, w in weights.items() if name != \"bias\")\n\n\ndef decide(night):\n    \"\"\"night: {\"dark\": 0 or 1, \"visibility_m\": metres, \"ice_mm\": ice on the hands in mm, \"wind\": Beaufort force}.\n\n    Returns {\"lamp\": bool, \"fog_lamp\": bool, \"heater\": bool}: the face lit, the fog lamp on, the hands heated.\n    \"\"\"\n    features = {\n        \"dark\": night[\"dark\"],\n        \"visibility_km\": night[\"visibility_m\"] / 1000,\n        \"ice_mm\": night[\"ice_mm\"],\n        \"wind\": night[\"wind\"],\n    }\n    return {name: score(weights, features) > 0 for name, weights in LEARNED.items()}\n"

REFERENCE = "\"\"\"A controller that follows the clockmaker's rules exactly.\"\"\"\n\n\ndef decide(night):\n    lamp = bool(night[\"dark\"]) or night[\"visibility_m\"] < 2000\n    fog_lamp = night[\"visibility_m\"] < 500\n    heater = night[\"ice_mm\"] >= 4.4 or (night[\"ice_mm\"] >= 4.0 and night[\"wind\"] >= 8)\n    return {\"lamp\": lamp, \"fog_lamp\": fog_lamp, \"heater\": heater}\n"


def load_tests(ctx, clock_source):
    module = ctx.module(files={"clock.py": clock_source})
    tests = [(name, value) for name, value in vars(module).items()
             if name.startswith("test_") and isinstance(value, _types.FunctionType)]
    if not tests:
        raise CheckFailed("There are no test_ functions in test_clock.py.")
    return tests


def failures(tests):
    failed = []
    for name, test in tests:
        try:
            test()
        except Exception as problem:
            failed.append((name, problem))
    return failed


def mutant(old, new):
    if old not in REFERENCE:
        raise RuntimeError("content bug: the text to break is not in the reference: " + old)
    return REFERENCE.replace(old, new)


def agree_with_the_rules(ctx):
    failed = failures(load_tests(ctx, REFERENCE))
    if failed:
        name, problem = failed[0]
        raise CheckFailed(f"{name} fails on a controller that follows the clockmaker's rules exactly, so it expects something the rules don't say. Check its answer against the rules.",
                          actual=f"{type(problem).__name__}: {problem}")


def catch_the_controller(ctx):
    if not failures(load_tests(ctx, MACHINE)):
        raise CheckFailed("Every test passes on the clock's controller. It's wrong on some nights: test the ones you found in the last step.")


def catches(what, old, new):
    broken = mutant(old, new)

    def check(ctx):
        if not failures(load_tests(ctx, broken)):
            raise CheckFailed(f"Every test passed on a controller where {what}. A test that can't fail isn't checking anything.")
    return check


def enough(ctx):
    tests = load_tests(ctx, REFERENCE)
    if len(tests) < 5:
        raise CheckFailed(f"There are {len(tests)} test functions. Write at least five: one for each rule and its edges, and the hard nights.", actual=len(tests))


LAMP = 'lamp = bool(night["dark"]) or night["visibility_m"] < 2000'
FOG = 'fog_lamp = night["visibility_m"] < 500'
HEATER = 'heater = night["ice_mm"] >= 4.4 or (night["ice_mm"] >= 4.0 and night["wind"] >= 8)'

TESTS = [
    custom("Your tests agree with the clockmaker's rules", agree_with_the_rules, visible=True,
           hint="Run each test in your head against the three rules. One of them expects something the rules don't say."),
    custom("Your tests catch the clock's controller", catch_the_controller, visible=True,
           hint="The clearest dark night, fog with ice on the hands, a gale with 4.2 mm of ice: test what the rules say should happen."),
    custom("At least five tests", enough),
    custom("Your tests notice a lamp that ignores the dark",
           catches("the lamp only follows visibility", LAMP, 'lamp = night["visibility_m"] < 2000'),
           hint="Test a dark night with perfect visibility."),
    custom("Your tests notice a lamp lit at exactly 2000 m",
           catches("the lamp is lit at 2000 m", LAMP, 'lamp = bool(night["dark"]) or night["visibility_m"] <= 2000'),
           hint="Under 2000 m means 1999 is lit and 2000 isn't. Test both."),
    custom("Your tests notice a fog lamp that waits until 400 m",
           catches("the fog lamp only comes on under 400 m", FOG, 'fog_lamp = night["visibility_m"] < 400'),
           hint="Test visibility of 499 m."),
    custom("Your tests notice a fog lamp on at exactly 500 m",
           catches("the fog lamp is on at 500 m", FOG, 'fog_lamp = night["visibility_m"] <= 500'),
           hint="Under 500 m: at 500 itself the fog lamp is off."),
    custom("Your tests notice a heater that ignores the wind",
           catches("the heater ignores the wind", HEATER, 'heater = night["ice_mm"] >= 4.4'),
           hint="Test 4.0 to 4.4 mm of ice in a gale."),
    custom("Your tests notice a heater that waits for more than 4.4 mm",
           catches("the heater stays off at exactly 4.4 mm", HEATER, 'heater = night["ice_mm"] > 4.4 or (night["ice_mm"] >= 4.0 and night["wind"] >= 8)'),
           hint="4.4 mm or more: test 4.4 exactly."),
    custom("Your tests notice a gale rule that starts at force 9",
           catches("the gale rule needs force 9", HEATER, 'heater = night["ice_mm"] >= 4.4 or (night["ice_mm"] >= 4.0 and night["wind"] >= 9)'),
           hint="Force 8 or above: test force 8 itself, at 4.0 mm."),
]
