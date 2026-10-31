import json as _json

NOVEMBER = """November 2026
Money in: £1,450.00
Money out: £602.35
food: £78.40 of £120.00
fun: £53.95 of £40.00, over by £13.95
home: £450.00 of £450.00
travel: £20.00
Left over: £847.65"""

OCTOBER = """October 2026
Money in: £1,450.00
Money out: £559.60
food: £58.40 of £120.00
fun: £12.50 of £40.00
home: £450.00 of £450.00
shop: £29.90
travel: £8.80
Left over: £890.40"""


def stderr_of(result):
    return "".join(text for kind, text in result.session.transcript.parts if kind == "err")


def run(ctx, argv, files=None):
    result = ctx.run_program(argv=argv, files=files)
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    return result


def expect(result, want, what):
    got = "\n".join(line.rstrip() for line in result.output.strip().splitlines())
    if got != want:
        raise CheckFailed(what, expected=want, actual=got or "(nothing)")
    if result.exit_code != 0:
        raise CheckFailed(f"It should finish with exit code 0, but finished with {result.exit_code}.")


def refused(ctx, argv, message):
    result = run(ctx, argv)
    if message not in stderr_of(result):
        raise CheckFailed(f"It should say, on sys.stderr: {message}", expected=message, actual=(result.output + stderr_of(result)).strip() or "(nothing)")
    if result.exit_code != 1:
        raise CheckFailed(f"It should finish with exit code 1, but finished with {result.exit_code}.")
    if result.files_out.get("money.json") is not None:
        raise CheckFailed("A refusal shouldn't save anything.", expected="money.json unchanged", actual="money.json saved")


def spend_then_report(ctx):
    first = run(ctx, ["add", "2026-11-22", "-3.20", "food", "--note", "pasty"])
    expect(first, "Spent £3.20 on food on 2026-11-22.", "Spending prints one line.")
    second = run(ctx, ["report", "2026-11"], files=first.files_out)
    expect(second, NOVEMBER.replace("£602.35", "£605.55").replace("£78.40", "£81.60").replace("£847.65", "£844.45"),
           "Run again, the report should include the pasty.")


def paid_in(ctx):
    first = run(ctx, ["add", "2026-12-01", "1450", "income", "--note", "shop wages"])
    expect(first, "Paid in £1,450.00 on 2026-12-01.", "Income prints one line.")
    second = run(ctx, ["balance"], files=first.files_out)
    expect(second, "Balance: £3,188.05", "Run again, the balance should include it.")


def a_budget(ctx):
    first = run(ctx, ["budget", "travel", "15"])
    expect(first, "Budget for travel: £15.00 a month.", "A budget prints one line.")
    second = run(ctx, ["report", "2026-11"], files=first.files_out)
    expect(second, NOVEMBER.replace("travel: £20.00", "travel: £20.00 of £15.00, over by £5.00"), "Run again, travel has a budget, and went over it.")


def saved_as_json(ctx):
    result = run(ctx, ["add", "2026-11-22", "-3.20", "food", "--note", "pasty"])
    text = result.files_out.get("money.json")
    if text is None:
        raise CheckFailed("Adding should save money.json.")
    data = _json.loads(text)
    if data["transactions"][-1] != {"day": "2026-11-22", "pence": -320, "category": "food", "note": "pasty"}:
        raise CheckFailed("The pasty should be saved as the last transaction, in pence.", actual=_json.dumps(data["transactions"][-1]))


def another_file(ctx):
    first = run(ctx, ["--file", "yahya.json", "add", "2026-11-05", "-1.20", "fun", "--note", "arcade"])
    expect(first, "Spent £1.20 on fun on 2026-11-05.", "With no file yet, the first transaction still goes in.")
    if "yahya.json" not in first.files_out:
        raise CheckFailed("--file yahya.json should save to yahya.json.")
    second = run(ctx, ["--file", "yahya.json", "report", "2026-11"], files=first.files_out)
    expect(second, "November 2026\nMoney in: £0.00\nMoney out: £1.20\nfun: £1.20\nLeft over: -£1.20", "Yahya's November.")


TESTS = [
    output("November's report", argv=["report", "2026-11"], expect=NOVEMBER, exit_code=0, visible=True),
    output("The balance", argv=["balance"], expect="Balance: £1,738.05", exit_code=0, visible=True),
    output("October's report", argv=["report", "2026-10"], expect=OCTOBER, exit_code=0,
           hint="A category with no budget shows only what was spent."),
    output("A month with nothing in it", argv=["report", "2026-12"], expect="Nothing in December 2026.", exit_code=0,
           hint="date(year, month, 1).strftime(\"%B %Y\") gives December 2026."),
    custom("Spend, then report", spend_then_report, hint="Load, add, save, then say what was added. Each run starts again from the file."),
    custom("Pay in, then the balance", paid_in),
    custom("Set a budget, then report", a_budget),
    custom("Saved as JSON, in pence", saved_as_json, hint="pence_from turns -3.20 into -320 before the ledger sees it."),
    custom("Another file", another_file, hint="--file comes before the command, and a file that isn't there yet is an empty ledger."),
    custom("Spending that's money in", lambda ctx: refused(ctx, ["add", "2026-11-22", "3.20", "food"], "Spending on food is money out, so it has to be less than 0.")),
    custom("A category that isn't one", lambda ctx: refused(ctx, ["add", "2026-11-22", "-1", "sweets"], "There's no category called sweets."),
           hint="Catch MoneyError around the command, print it to sys.stderr, and sys.exit(1) before anything is saved."),
    custom("A budget for income", lambda ctx: refused(ctx, ["budget", "income", "100"], "There's no spending category called income.")),
    output("An amount that isn't a number", argv=["add", "2026-11-22", "four", "food"], expect="", exit_code=2,
           hint="type=pence_from makes argparse turn the amount into pence, and refuse four with exit code 2."),
    output("A day that isn't a date", argv=["add", "Thursday", "-1", "food"], expect="", exit_code=2,
           hint="type=date.fromisoformat makes argparse refuse a day that isn't like 2026-11-22."),
    output("A month that isn't one", argv=["report", "2026-13"], expect="", exit_code=2,
           hint="month_from should raise a ValueError for month 13, so argparse refuses it."),
    output("A command that doesn't exist", argv=["spend", "4"], expect="", exit_code=2),
]
