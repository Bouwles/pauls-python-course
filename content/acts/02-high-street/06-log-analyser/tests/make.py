import ast as _ast

REPORT = """11 entries read
Errors by machine:
  lights: 2
  printer: 2
  thermostat: 1
Skipped 3 lines:
  line 6: expected 4 parts, got 3
  line 9: unknown level WARNING
  line 12: expected 4 parts, got 1"""


def unknown_level_raises(ctx):
    module = ctx.module()
    try:
        module.parse_line("09:00 | NOTICE | lights | odd\n", 7)
    except ValueError as error:
        if "line 7" not in str(error):
            raise CheckFailed("The ValueError should say which line it came from.", expected="line 7: unknown level NOTICE", actual=str(error))
        return
    raise CheckFailed("parse_line should still raise ValueError for a level that isn't in LEVELS.", expected="ValueError", actual="no error")


def read_log_two_lists(ctx):
    module = ctx.module(files={"short.log": "06:00 | INFO | lights | on\nnonsense\n"})
    result = module.read_log("short.log")
    expected = ([("06:00", "INFO", "lights", "on")], ["line 2: expected 4 parts, got 1"])
    if not isinstance(result, tuple) or len(result) != 2:
        raise CheckFailed("read_log should give back two things: the entries and the problems.", expected=repr(expected), actual=repr(result))
    entries, problems = result
    if list(entries) != expected[0] or list(problems) != expected[1]:
        raise CheckFailed("read_log('short.log') gave back the wrong entries or problems.", expected=repr(expected), actual=repr(result))


def names_the_error(tree, source):
    for node in _ast.walk(tree):
        if isinstance(node, _ast.ExceptHandler):
            if node.type is None or (isinstance(node.type, _ast.Name) and node.type.id in ("Exception", "BaseException")):
                return "Catch ValueError, the error parse_line raises. Catching everything would hide real bugs, as it did for Caitlin."


TESTS = [
    output("The Clocktower's log", expect=REPORT, visible=True),
    function("A tidy line, in lower case", call="parse_line", args=("06:42 | info | thermostat | heating on\n", 3),
             expect=("06:42", "INFO", "thermostat", "heating on"), visible=True),
    output("A clean log", files={"machines.log": "06:00 | INFO | lights | lights off\n06:30 | ERROR | lights | bulb failed\n07:00 | error | printer | no paper\n"},
           expect="3 entries read\nErrors by machine:\n  lights: 1\n  printer: 1\nNothing skipped.",
           hint="When every line is fine, the report ends with Nothing skipped."),
    output("Blank lines are not problems", files={"machines.log": "\n06:00 | INFO | lights | on\n   \n\n07:00 | ERROR | lights | off\n"},
           expect="2 entries read\nErrors by machine:\n  lights: 1\nNothing skipped.",
           hint="A line with nothing but spaces on it is skipped without a word. It isn't an entry, and it isn't a problem."),
    output("Every line is bad", files={"machines.log": "power cut\n09:00 | NOTICE | lights | odd\n"},
           expect="0 entries read\nErrors by machine:\nSkipped 2 lines:\n  line 1: expected 4 parts, got 1\n  line 2: unknown level NOTICE",
           hint="Even with nothing to count, the report still prints, and lists every line it skipped."),
    custom("parse_line still refuses an unknown level", unknown_level_raises,
           hint="Upper-case the level first, then check it against LEVELS. Anything still not in LEVELS raises ValueError."),
    custom("read_log gives back the entries and the problems", read_log_two_lists,
           hint="read_log returns two lists: return entries, problems. Each problem is the error's message, str(error)."),
    structure("Catches ValueError, not everything", check=names_the_error),
]
