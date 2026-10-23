BEA = "101 oven door hinge (done, 1.5 h)\n106 bread slicer (open, 2 h)\nTotal: 3.5 h"
SCRAPYARD = "number,customer,item,status,hours\n1,Nell,crane hook,open,6\n2,Nell,gate latch,done,1\n3,Ashby,filing cabinet,open,2.5\n"


def stderr_of(result):
    return "".join(text for kind, text in result.session.transcript.parts if kind == "err")


def run(ctx, argv, files=None):
    result = ctx.run_program(argv=argv, files=files)
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    return result


def refused(ctx, argv, message):
    result = run(ctx, argv)
    said = result.output + stderr_of(result)
    if message not in said:
        raise CheckFailed(f"It should say: {message}", expected=message, actual=said.strip() or "(nothing)")
    if result.exit_code != 1:
        raise CheckFailed(f"It should finish with exit code 1, but finished with {result.exit_code}.", expected=message, actual=said.strip())


def no_jobs(ctx):
    refused(ctx, ["Gwen"], "No jobs for Gwen.")


def moss_never_finishes(ctx):
    refused(ctx, ["Moss", "--status", "done"], "No jobs for Moss.")


def no_ledger(ctx):
    refused(ctx, ["Bea", "--file", "old.csv"], "Can't find old.csv.")


def errors_to_stderr(ctx):
    result = run(ctx, ["Gwen"])
    if result.output.strip():
        raise CheckFailed("Problems go to sys.stderr, so nothing should reach the normal output.", expected="(nothing on the normal output)", actual=result.output.strip())
    if "No jobs for Gwen." not in stderr_of(result):
        raise CheckFailed("The message should go to sys.stderr.", expected="No jobs for Gwen.", actual=stderr_of(result).strip() or "(nothing)")


TESTS = [
    output("Bea's jobs", argv=["Bea"], expect=BEA, exit_code=0, visible=True),
    output("Ferro's open jobs", argv=["Ferro", "--status", "open"], expect="102 winch handle (open, 3 h)\nTotal: 3.0 h", exit_code=0, visible=True),
    output("Tom's jobs", argv=["Tom"], expect="104 lamp bracket (done, 0.5 h)\nTotal: 0.5 h", exit_code=0,
           hint="One job is still a list of one, then the total."),
    output("All of Ferro's jobs", argv=["Ferro"], expect="102 winch handle (open, 3 h)\n105 cabin door (done, 4 h)\nTotal: 7.0 h", exit_code=0,
           hint="Without --status, every job for that customer counts, open or done."),
    output("A name in lower case", argv=["mira"], expect="103 sorting rack (open, 2 h)\nTotal: 2.0 h", exit_code=0,
           hint="Compare the names in lower case on both sides, so mira finds Mira."),
    custom("No jobs for Gwen", no_jobs,
           hint="When nothing matches, print No jobs for NAME. and finish with sys.exit(1)."),
    custom("Moss has no finished jobs", moss_never_finishes,
           hint="Moss has jobs, but none are done. Check the status filter before deciding there are no jobs."),
    custom("Problems go to stderr", errors_to_stderr,
           hint="print(message, file=sys.stderr) keeps problems out of the results."),
    output("A different ledger", argv=["Nell", "--file", "scrapyard.csv"], files={"scrapyard.csv": SCRAPYARD},
           expect="1 crane hook (open, 6 h)\n2 gate latch (done, 1 h)\nTotal: 7.0 h", exit_code=0,
           hint="Open whatever file --file names, with jobs.csv as the default."),
    custom("No ledger at all", no_ledger,
           hint="Opening a file that isn't there raises FileNotFoundError. Catch it, say Can't find NAME. and exit with 1."),
    output("No name given", argv=[], expect="", exit_code=2,
           hint="If argparse knows the customer is required, it stops with exit code 2 by itself."),
    output("A status that doesn't exist", argv=["Bea", "--status", "lost"], expect="", exit_code=2,
           hint="choices=[\"open\", \"done\"] makes argparse refuse anything else, with exit code 2."),
    output("--help works", argv=["--help"], expect="usage:", match="contains", exit_code=0,
           hint="argparse writes --help for you, as long as the tool is built on argparse.ArgumentParser."),
]
