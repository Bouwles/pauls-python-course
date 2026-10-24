import types as _types

MACHINE = "\"\"\"The machine on the hill. A. Penhallow.\n\nSix winters it watched me run the lamp, the fog horn and the sea wall gate,\nand learned to do it. These numbers are what it learned. I never wrote down why.\n\"\"\"\n\nLEARNED = {\n    \"lamp\": {\"dark\": 10.0, \"visibility_km\": -1.0, \"bias\": 2.0},\n    \"horn\": {\"visibility_km\": -10.0, \"tide_m\": -1.5, \"bias\": 8.0},\n    \"gate\": {\"tide_m\": 6.0, \"wind\": 0.0, \"bias\": -27.6},\n}\n\n\ndef score(weights, features):\n    return weights[\"bias\"] + sum(w * features[name] for name, w in weights.items() if name != \"bias\")\n\n\ndef decide(night):\n    \"\"\"night: {\"dark\": 0 or 1, \"visibility_m\": metres, \"tide_m\": metres, \"wind\": Beaufort force}.\n\n    Returns {\"lamp\": bool, \"horn\": bool, \"gate\": bool}: the lamp lit, the horn sounding, the gate shut.\n    \"\"\"\n    features = {\n        \"dark\": night[\"dark\"],\n        \"visibility_km\": night[\"visibility_m\"] / 1000,\n        \"tide_m\": night[\"tide_m\"],\n        \"wind\": night[\"wind\"],\n    }\n    return {name: score(weights, features) > 0 for name, weights in LEARNED.items()}\n"

REFERENCE = "\"\"\"A machine that follows Old Tom's rules exactly.\"\"\"\n\n\ndef decide(night):\n    lamp = bool(night[\"dark\"]) or night[\"visibility_m\"] < 2000\n    horn = night[\"visibility_m\"] < 500\n    gate = night[\"tide_m\"] >= 4.4 or (night[\"tide_m\"] >= 4.0 and night[\"wind\"] >= 8)\n    return {\"lamp\": lamp, \"horn\": horn, \"gate\": gate}\n"


def load_tests(ctx, hill_source):
    module = ctx.module(files={"hill.py": hill_source})
    tests = [(name, value) for name, value in vars(module).items()
             if name.startswith("test_") and isinstance(value, _types.FunctionType)]
    if not tests:
        raise CheckFailed("There are no test_ functions in test_hill.py.")
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


def agree_with_tom(ctx):
    failed = failures(load_tests(ctx, REFERENCE))
    if failed:
        name, problem = failed[0]
        raise CheckFailed(f"{name} fails on a machine that follows Tom's rules exactly, so it expects something the rules don't say. Check its answer against the rules.",
                          actual=f"{type(problem).__name__}: {problem}")


def catch_the_machine(ctx):
    if not failures(load_tests(ctx, MACHINE)):
        raise CheckFailed("Every test passes on the machine on the hill. It's wrong on some nights: test the ones you found in the last step.")


def catches(what, old, new):
    broken = mutant(old, new)

    def check(ctx):
        if not failures(load_tests(ctx, broken)):
            raise CheckFailed(f"Every test passed on a machine where {what}. A test that can't fail isn't checking anything.")
    return check


def enough(ctx):
    tests = load_tests(ctx, REFERENCE)
    if len(tests) < 5:
        raise CheckFailed(f"There are {len(tests)} test functions. Write at least five: one for each rule and its edges, and the hard nights.", actual=len(tests))


LAMP = 'lamp = bool(night["dark"]) or night["visibility_m"] < 2000'
HORN = 'horn = night["visibility_m"] < 500'
GATE = 'gate = night["tide_m"] >= 4.4 or (night["tide_m"] >= 4.0 and night["wind"] >= 8)'

TESTS = [
    custom("Your tests agree with Tom's rules", agree_with_tom, visible=True,
           hint="Run each test in your head against the three rules. One of them expects something the rules don't say."),
    custom("Your tests catch the machine on the hill", catch_the_machine, visible=True,
           hint="The clearest dark night, fog at a spring tide, a gale at 4.2 metres: test what Tom's rules say should happen."),
    custom("At least five tests", enough),
    custom("Your tests notice a lamp that ignores the dark",
           catches("the lamp only follows visibility", LAMP, 'lamp = night["visibility_m"] < 2000'),
           hint="Test a dark night with perfect visibility."),
    custom("Your tests notice a lamp lit at exactly 2000 m",
           catches("the lamp is lit at 2000 m", LAMP, 'lamp = bool(night["dark"]) or night["visibility_m"] <= 2000'),
           hint="Under 2000 m means 1999 is lit and 2000 isn't. Test both."),
    custom("Your tests notice a horn that waits until 400 m",
           catches("the horn only sounds under 400 m", HORN, 'horn = night["visibility_m"] < 400'),
           hint="Test visibility of 499 m."),
    custom("Your tests notice a horn at exactly 500 m",
           catches("the horn sounds at 500 m", HORN, 'horn = night["visibility_m"] <= 500'),
           hint="Under 500 m: 500 itself is quiet."),
    custom("Your tests notice a gate that ignores the wind",
           catches("the gate ignores the wind", GATE, 'gate = night["tide_m"] >= 4.4'),
           hint="Test a tide of 4.0 to 4.4 metres in a gale."),
    custom("Your tests notice a gate that waits for more than 4.4 m",
           catches("the gate stays open at exactly 4.4 m", GATE, 'gate = night["tide_m"] > 4.4 or (night["tide_m"] >= 4.0 and night["wind"] >= 8)'),
           hint="4.4 metres or more: test 4.4 exactly."),
    custom("Your tests notice a gale rule that starts at force 9",
           catches("the gale rule needs force 9", GATE, 'gate = night["tide_m"] >= 4.4 or (night["tide_m"] >= 4.0 and night["wind"] >= 9)'),
           hint="Force 8 or above: test force 8 itself, at 4.0 metres."),
]
