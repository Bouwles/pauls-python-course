import types as _types

BRAKES = "06:12 ERROR brakes: overheating\n06:37 ERROR brakes: overheating\n07:57 ERROR brakes: overheating"
MIDNIGHT = "\n".join([
    "00:00 INFO tyres: pressures good", "00:01 INFO engine: reading 88.5 C", "00:02 INFO brakes: cool",
    "00:03 INFO radio: quiet", "00:04 INFO fuel: on target", "00:05 INFO tyres: grip good",
    "00:06 INFO engine: reading 88.5 C", "00:07 INFO brakes: warm", "00:08 INFO radio: quiet",
    "00:09 INFO fuel: lean mix",
])
SHORT_LOG = "07:05 | ERROR | brakes | overheating\n\n07:15 | ERROR | radio\n 08:10 |  error  | tyres | puncture\n08:22 | INFO | radio | 14 laps to go\n"


class Endless:
    """A log that never ends. Complains if something reads too far ahead."""

    def __init__(self, item, limit=50):
        self.item = item
        self.limit = limit
        self.pulled = 0

    def __iter__(self):
        return self

    def __next__(self):
        self.pulled += 1
        if self.pulled > self.limit:
            raise CheckFailed("It tried to read the whole log before handing anything over. Yield each one as soon as it's ready.")
        return self.item


def is_generator(what, value):
    if not isinstance(value, _types.GeneratorType):
        raise CheckFailed(f"{what} should be a generator, handing lines over one at a time: use yield, not a list.", expected="a generator", actual=type(value).__name__)


def read_short(ctx):
    m = ctx.module(files={"short.log": SHORT_LOG})
    lines = m.read_lines("short.log")
    is_generator("read_lines(...)", lines)
    got = list(lines)
    want = ["07:05 | ERROR | brakes | overheating", "07:15 | ERROR | radio", " 08:10 |  error  | tyres | puncture", "08:22 | INFO | radio | 14 laps to go"]
    if got != want:
        raise CheckFailed("read_lines should give every line without its newline, and skip the blank one.", expected=repr(want), actual=repr(got))


def parse_short(ctx):
    m = ctx.module()
    entries = m.parse(["07:05 | ERROR | brakes | overheating", "07:15 | ERROR | radio", " 08:10 |  error  | tyres | puncture", "08:11 | INFO | radio | box | box"])
    is_generator("parse(...)", entries)
    got = list(entries)
    want = [("07:05", "ERROR", "brakes", "overheating"), ("08:10", "ERROR", "tyres", "puncture"), ("08:11", "INFO", "radio", "box | box")]
    if got != want:
        raise CheckFailed("parse should give a tuple for each line with four parts, stripped, with the level in capitals.", expected=repr(want), actual=repr(got))


def parse_lazily(ctx):
    m = ctx.module()
    endless = Endless("09:00 | INFO | tyres | grip good")
    entries = m.parse(endless)
    got = [next(entries), next(entries)]
    if got[0] != ("09:00", "INFO", "tyres", "grip good") or endless.pulled > 2:
        raise CheckFailed("Asked for two entries, parse should read two lines.", expected="2 lines read", actual=f"{endless.pulled} lines read")


ENTRIES = [("06:12", "ERROR", "brakes", "overheating"), ("06:13", "INFO", "fuel", "on target"),
           ("07:35", "ERROR", "tyres", "puncture"), ("07:36", "WARN", "brakes", "glazing")]


def matching_cases(ctx):
    m = ctx.module()
    checks = [
        ({"level": "error"}, [ENTRIES[0], ENTRIES[2]], "level=\"error\": capitals don't matter"),
        ({"system": "brakes"}, [ENTRIES[0], ENTRIES[3]], "system=\"brakes\""),
        ({"level": "ERROR", "system": "brakes"}, [ENTRIES[0]], "both at once"),
        ({}, ENTRIES, "neither: every entry"),
        ({"system": "kettle"}, [], "a system that isn't there"),
    ]
    for kwargs, want, what in checks:
        result = m.matching(iter(ENTRIES), **kwargs)
        is_generator("matching(...)", result)
        got = list(result)
        if got != want:
            raise CheckFailed(f"matching with {what}.", expected=repr(want), actual=repr(got))


def matching_lazily(ctx):
    m = ctx.module()
    endless = Endless(("10:00", "ERROR", "tyres", "puncture"))
    found = m.matching(endless, level="ERROR")
    next(found)
    if endless.pulled > 1:
        raise CheckFailed("Asked for one match, matching should read only as far as the first.", expected="1 entry read", actual=f"{endless.pulled} entries read")


def first_takes_no_more(ctx):
    m = ctx.module()
    endless = Endless(("10:00", "ERROR", "tyres", "puncture"))
    got = m.first(endless, 4)
    if not isinstance(got, list) or len(got) != 4:
        raise CheckFailed("first(entries, 4) should give a list of four.", expected="4 entries", actual=repr(got)[:120])
    if endless.pulled != 4:
        raise CheckFailed("first should take exactly as many as it needs, and stop.", expected="4 read", actual=f"{endless.pulled} read")


def first_of_none(ctx):
    m = ctx.module()
    endless = Endless(("10:00", "ERROR", "tyres", "puncture"))
    if m.first(endless, 0) != [] or endless.pulled != 0:
        raise CheckFailed("first(entries, 0) is an empty list, and reads nothing at all.", expected="[] and nothing read", actual=f"{endless.pulled} read")
    if m.first(iter(ENTRIES[:2]), 5) != ENTRIES[:2]:
        raise CheckFailed("When there are fewer than count, first gives all there are.", expected=repr(ENTRIES[:2]))


TESTS = [
    output("Brake errors, the first three", argv=["--level", "ERROR", "--system", "brakes", "--first", "3"], expect=BRAKES, visible=True),
    output("The first ten minutes of the race", argv=[], expect=MIDNIGHT, visible=True,
           hint="With no options, every entry matches, and --first is 10."),
    custom("read_lines of a short log", read_short, hint="Take the newline off the end of each line, but leave the rest of it alone; skip lines with nothing on them."),
    custom("parse of a few lines", parse_short,
           hint="split(\"|\", 3) keeps a message that has | in it in one piece. Skip a line that hasn't four parts."),
    custom("parse reads only what it's asked for", parse_lazily),
    custom("matching by level, by system, by both", matching_cases,
           hint="None means any. Compare levels in capitals, so error finds ERROR."),
    custom("matching reads only what it's asked for", matching_lazily),
    custom("first takes no more than it needs", first_takes_no_more,
           hint="Stop asking as soon as the list has count in it: break out of the loop."),
    custom("first of nothing, and first of not enough", first_of_none,
           hint="With a count of 0, don't ask for anything at all."),
    output("A system no car has", argv=["--system", "duck"], expect="Nothing found."),
    output("Warnings, in lower case", argv=["--level", "warn", "--first", "2"],
           expect="01:03 WARN radio: signal weak\n01:48 WARN radio: signal weak"),
    output("Two in the morning", argv=["--system", "pit"], expect="02:00 INFO pit: driver change, Yahya in"),
    structure("Generators", requires=["Yield"], message="read_lines, parse and matching should be generators, with yield."),
]
