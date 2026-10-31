import types as _types

PRINTER = "06:12 ERROR printer: out of paper\n06:37 ERROR printer: out of paper\n07:57 ERROR printer: out of paper"
MIDNIGHT = "\n".join([
    "00:00 INFO lights: all on", "00:01 INFO thermostat: reading 18.5 C", "00:02 INFO printer: ready",
    "00:03 INFO front-door: nobody in", "00:04 INFO server: backup done", "00:05 INFO lights: lights on",
    "00:06 INFO thermostat: reading 18.5 C", "00:07 INFO printer: standing by", "00:08 INFO front-door: nobody in",
    "00:09 INFO server: backup running",
])
SHORT_LOG = "07:05 | ERROR | printer | out of paper\n\n07:15 | ERROR | front-door\n 08:10 |  error  | lights | bulb failed\n08:22 | INFO | front-door | 14 people in\n"


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
    want = ["07:05 | ERROR | printer | out of paper", "07:15 | ERROR | front-door", " 08:10 |  error  | lights | bulb failed", "08:22 | INFO | front-door | 14 people in"]
    if got != want:
        raise CheckFailed("read_lines should give every line without its newline, and skip the blank one.", expected=repr(want), actual=repr(got))


def parse_short(ctx):
    m = ctx.module()
    entries = m.parse(["07:05 | ERROR | printer | out of paper", "07:15 | ERROR | front-door", " 08:10 |  error  | lights | bulb failed", "08:11 | INFO | printer | tray | stuck"])
    is_generator("parse(...)", entries)
    got = list(entries)
    want = [("07:05", "ERROR", "printer", "out of paper"), ("08:10", "ERROR", "lights", "bulb failed"), ("08:11", "INFO", "printer", "tray | stuck")]
    if got != want:
        raise CheckFailed("parse should give a tuple for each line with four parts, stripped, with the level in capitals.", expected=repr(want), actual=repr(got))


def parse_lazily(ctx):
    m = ctx.module()
    endless = Endless("09:00 | INFO | lights | lights on")
    entries = m.parse(endless)
    got = [next(entries), next(entries)]
    if got[0] != ("09:00", "INFO", "lights", "lights on") or endless.pulled > 2:
        raise CheckFailed("Asked for two entries, parse should read two lines.", expected="2 lines read", actual=f"{endless.pulled} lines read")


ENTRIES = [("06:12", "ERROR", "printer", "out of paper"), ("06:13", "INFO", "server", "backup done"),
           ("07:35", "ERROR", "lights", "bulb failed"), ("07:36", "WARN", "printer", "low toner")]


def matching_cases(ctx):
    m = ctx.module()
    checks = [
        ({"level": "error"}, [ENTRIES[0], ENTRIES[2]], "level=\"error\": capitals don't matter"),
        ({"machine": "printer"}, [ENTRIES[0], ENTRIES[3]], "machine=\"printer\""),
        ({"level": "ERROR", "machine": "printer"}, [ENTRIES[0]], "both at once"),
        ({}, ENTRIES, "neither: every entry"),
        ({"machine": "kettle"}, [], "a machine that isn't there"),
    ]
    for kwargs, want, what in checks:
        result = m.matching(iter(ENTRIES), **kwargs)
        is_generator("matching(...)", result)
        got = list(result)
        if got != want:
            raise CheckFailed(f"matching with {what}.", expected=repr(want), actual=repr(got))


def matching_lazily(ctx):
    m = ctx.module()
    endless = Endless(("10:00", "ERROR", "lights", "bulb failed"))
    found = m.matching(endless, level="ERROR")
    next(found)
    if endless.pulled > 1:
        raise CheckFailed("Asked for one match, matching should read only as far as the first.", expected="1 entry read", actual=f"{endless.pulled} entries read")


def first_takes_no_more(ctx):
    m = ctx.module()
    endless = Endless(("10:00", "ERROR", "lights", "bulb failed"))
    got = m.first(endless, 4)
    if not isinstance(got, list) or len(got) != 4:
        raise CheckFailed("first(entries, 4) should give a list of four.", expected="4 entries", actual=repr(got)[:120])
    if endless.pulled != 4:
        raise CheckFailed("first should take exactly as many as it needs, and stop.", expected="4 read", actual=f"{endless.pulled} read")


def first_of_none(ctx):
    m = ctx.module()
    endless = Endless(("10:00", "ERROR", "lights", "bulb failed"))
    if m.first(endless, 0) != [] or endless.pulled != 0:
        raise CheckFailed("first(entries, 0) is an empty list, and reads nothing at all.", expected="[] and nothing read", actual=f"{endless.pulled} read")
    if m.first(iter(ENTRIES[:2]), 5) != ENTRIES[:2]:
        raise CheckFailed("When there are fewer than count, first gives all there are.", expected=repr(ENTRIES[:2]))


TESTS = [
    output("Printer errors, the first three", argv=["--level", "ERROR", "--machine", "printer", "--first", "3"], expect=PRINTER, visible=True),
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
    output("A machine nobody has", argv=["--machine", "duck"], expect="Nothing found."),
    output("Warnings, in lower case", argv=["--level", "warn", "--first", "2"],
           expect="01:03 WARN front-door: card reader slow\n01:48 WARN front-door: card reader slow"),
    output("Two in the morning", argv=["--machine", "clock"], expect="02:00 INFO clock: still 3:14"),
    structure("Generators", requires=["Yield"], message="read_lines, parse and matching should be generators, with yield."),
]
