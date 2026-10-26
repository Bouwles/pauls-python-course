import types as _types

FOG = "06:12 ERROR fog-horn: no air pressure\n06:37 ERROR fog-horn: no air pressure\n07:57 ERROR fog-horn: no air pressure"
MIDNIGHT = "\n".join([
    "00:00 INFO lamp: beam steady", "00:01 INFO tide-gauge: reading 1.2 m", "00:02 INFO fog-horn: pressure normal",
    "00:03 INFO ferry-fares: no passengers", "00:04 INFO sea-wall: gate shut", "00:05 INFO lamp: lamp lit",
    "00:06 INFO tide-gauge: reading 1.2 m", "00:07 INFO fog-horn: standing by", "00:08 INFO ferry-fares: no passengers",
    "00:09 INFO sea-wall: gate open",
])
SHORT_LOG = "07:05 | ERROR | fog-horn | no air pressure\n\n07:15 | ERROR | ferry-fares\n 08:10 |  error  | lamp | bulb failed\n08:22 | INFO | ferry-fares | 14 fares taken\n"


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
    want = ["07:05 | ERROR | fog-horn | no air pressure", "07:15 | ERROR | ferry-fares", " 08:10 |  error  | lamp | bulb failed", "08:22 | INFO | ferry-fares | 14 fares taken"]
    if got != want:
        raise CheckFailed("read_lines should give every line without its newline, and skip the blank one.", expected=repr(want), actual=repr(got))


def parse_short(ctx):
    m = ctx.module()
    entries = m.parse(["07:05 | ERROR | fog-horn | no air pressure", "07:15 | ERROR | ferry-fares", " 08:10 |  error  | lamp | bulb failed", "08:11 | INFO | fog-horn | valve | stuck"])
    is_generator("parse(...)", entries)
    got = list(entries)
    want = [("07:05", "ERROR", "fog-horn", "no air pressure"), ("08:10", "ERROR", "lamp", "bulb failed"), ("08:11", "INFO", "fog-horn", "valve | stuck")]
    if got != want:
        raise CheckFailed("parse should give a tuple for each line with four parts, stripped, with the level in capitals.", expected=repr(want), actual=repr(got))


def parse_lazily(ctx):
    m = ctx.module()
    endless = Endless("09:00 | INFO | lamp | lamp lit")
    entries = m.parse(endless)
    got = [next(entries), next(entries)]
    if got[0] != ("09:00", "INFO", "lamp", "lamp lit") or endless.pulled > 2:
        raise CheckFailed("Asked for two entries, parse should read two lines.", expected="2 lines read", actual=f"{endless.pulled} lines read")


ENTRIES = [("06:12", "ERROR", "fog-horn", "no air pressure"), ("06:13", "INFO", "sea-wall", "gate shut"),
           ("07:35", "ERROR", "lamp", "bulb failed"), ("07:36", "WARN", "fog-horn", "low pressure")]


def matching_cases(ctx):
    m = ctx.module()
    checks = [
        ({"level": "error"}, [ENTRIES[0], ENTRIES[2]], "level=\"error\": capitals don't matter"),
        ({"machine": "fog-horn"}, [ENTRIES[0], ENTRIES[3]], "machine=\"fog-horn\""),
        ({"level": "ERROR", "machine": "fog-horn"}, [ENTRIES[0]], "both at once"),
        ({}, ENTRIES, "neither: every entry"),
        ({"machine": "hill"}, [], "a machine that isn't there"),
    ]
    for kwargs, want, what in checks:
        result = m.matching(iter(ENTRIES), **kwargs)
        is_generator("matching(...)", result)
        got = list(result)
        if got != want:
            raise CheckFailed(f"matching with {what}.", expected=repr(want), actual=repr(got))


def matching_lazily(ctx):
    m = ctx.module()
    endless = Endless(("10:00", "ERROR", "lamp", "bulb failed"))
    found = m.matching(endless, level="ERROR")
    next(found)
    if endless.pulled > 1:
        raise CheckFailed("Asked for one match, matching should read only as far as the first.", expected="1 entry read", actual=f"{endless.pulled} entries read")


def first_takes_no_more(ctx):
    m = ctx.module()
    endless = Endless(("10:00", "ERROR", "lamp", "bulb failed"))
    got = m.first(endless, 4)
    if not isinstance(got, list) or len(got) != 4:
        raise CheckFailed("first(entries, 4) should give a list of four.", expected="4 entries", actual=repr(got)[:120])
    if endless.pulled != 4:
        raise CheckFailed("first should take exactly as many as it needs, and stop.", expected="4 read", actual=f"{endless.pulled} read")


def first_of_none(ctx):
    m = ctx.module()
    endless = Endless(("10:00", "ERROR", "lamp", "bulb failed"))
    if m.first(endless, 0) != [] or endless.pulled != 0:
        raise CheckFailed("first(entries, 0) is an empty list, and reads nothing at all.", expected="[] and nothing read", actual=f"{endless.pulled} read")
    if m.first(iter(ENTRIES[:2]), 5) != ENTRIES[:2]:
        raise CheckFailed("When there are fewer than count, first gives all there are.", expected=repr(ENTRIES[:2]))


TESTS = [
    output("Fog horn errors, the first three", argv=["--level", "ERROR", "--machine", "fog-horn", "--first", "3"], expect=FOG, visible=True),
    output("The first ten of the day", argv=[], expect=MIDNIGHT, visible=True,
           hint="With no options, every entry matches, and --first is 10."),
    custom("read_lines of a short log", read_short, hint="Take the newline off the end of each line, but leave the rest of it alone; skip lines with nothing on them."),
    custom("parse of a few lines", parse_short,
           hint="split(\"|\", 3) keeps a message that has | in it in one piece. Skip a line that hasn't four parts."),
    custom("parse reads only what it's asked for", parse_lazily),
    custom("matching by level, by machine, by both", matching_cases,
           hint="None means any. Compare levels in capitals, so error finds ERROR."),
    custom("matching reads only what it's asked for", matching_lazily),
    custom("first takes no more than it needs", first_takes_no_more,
           hint="Stop asking as soon as the list has count in it: break out of the loop."),
    custom("first of nothing, and first of not enough", first_of_none,
           hint="With a count of 0, don't ask for anything at all."),
    output("A machine nobody has", argv=["--machine", "lighthouse-cat"], expect="Nothing found."),
    output("Warnings, in lower case", argv=["--level", "warn", "--first", "2"],
           expect="01:03 WARN ferry-fares: card reader slow\n01:48 WARN ferry-fares: card reader slow"),
    output("Two in the morning", argv=["--machine", "hill"], expect="02:00 INFO hill: still learning"),
    structure("Generators", requires=["Yield"], message="read_lines, parse and matching should be generators, with yield."),
]
