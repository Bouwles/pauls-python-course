import json

LIST = "1 [ ] oil the bench vice\n2 [x] sharpen the chisels\n3 [ ] order more biscuits"


def stderr_of(result):
    return "".join(text for kind, text in result.session.transcript.parts if kind == "err")


def run(ctx, argv, files=None):
    result = ctx.run_program(argv=argv, files=files)
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    return result


def saved(result, name="todo.json"):
    text = result.files_out.get(name)
    if text is None:
        raise CheckFailed(f"It should save the list in {name}.", expected=name, actual="nothing saved")
    try:
        return json.loads(text)
    except ValueError:
        raise CheckFailed(f"{name} should hold the list as JSON.", actual=text[:200])


def expect_output(result, want, what):
    got = "\n".join(line.rstrip() for line in result.output.strip().splitlines())
    if got != want:
        raise CheckFailed(what, expected=want, actual=got or "(nothing)")


def refused(ctx, argv, message, files=None):
    result = run(ctx, argv, files)
    if message not in stderr_of(result):
        raise CheckFailed(f"It should say, on sys.stderr: {message}", expected=message, actual=(result.output + stderr_of(result)).strip() or "(nothing)")
    if result.output.strip():
        raise CheckFailed("Problems go to sys.stderr, so nothing should reach the normal output.", expected="(nothing on the normal output)", actual=result.output.strip())
    if result.exit_code != 1:
        raise CheckFailed(f"It should finish with exit code 1, but finished with {result.exit_code}.")


def add_then_list(ctx):
    first = run(ctx, ["add", "fix the radio"])
    expect_output(first, "Added 4: fix the radio", "Adding a task says its number.")
    tasks = saved(first)
    if tasks[-1] != {"number": 4, "task": "fix the radio", "done": False} or len(tasks) != 4:
        raise CheckFailed("todo.json should now have the new task on the end.", expected='... {"number": 4, "task": "fix the radio", "done": false}', actual=json.dumps(tasks))
    second = run(ctx, ["list"], files=first.files_out)
    expect_output(second, LIST + "\n4 [ ] fix the radio", "Run again, the list should still have the new task on it.")


def tick_off(ctx):
    first = run(ctx, ["done", "3"])
    expect_output(first, "Done: order more biscuits", "Ticking off task 3.")
    second = run(ctx, ["list", "--open"], files=first.files_out)
    expect_output(second, "1 [ ] oil the bench vice", "Run again, task 3 should be done, so --open leaves it out.")


def already_done(ctx):
    result = run(ctx, ["done", "2"])
    expect_output(result, "Already done: sharpen the chisels", "Ticking off a task that's done already.")
    if result.exit_code != 0:
        raise CheckFailed("Already done isn't a failure: exit code 0.", expected=0, actual=result.exit_code)


def no_such_task(ctx):
    refused(ctx, ["done", "9"], "There's no task 9.")


def first_run(ctx):
    result = run(ctx, ["--file", "shed.json", "add", "count the bikes"])
    expect_output(result, "Added 1: count the bikes", "With no file yet, the first task is number 1.")
    if saved(result, "shed.json") != [{"number": 1, "task": "count the bikes", "done": False}]:
        raise CheckFailed("shed.json should hold the one task.", actual=json.dumps(saved(result, "shed.json")))


def next_number(ctx):
    gappy = json.dumps([{"number": 1, "task": "a", "done": True}, {"number": 5, "task": "b", "done": False}])
    result = run(ctx, ["add", "c"], files={"todo.json": gappy})
    expect_output(result, "Added 6: c", "A new task's number is one more than the highest so far.")


def broken_file(ctx):
    refused(ctx, ["list"], "todo.json isn't a to-do list I can read.", files={"todo.json": "oil, chisels, biscuits"})


TESTS = [
    output("The list as it is", argv=["list"], expect=LIST, exit_code=0, visible=True),
    custom("Add a task, then list them", add_then_list, visible=True,
           hint="Load the list, append the new task, save it, then say what was added. Each run starts again from the file."),
    output("Only what's still to do", argv=["list", "--open"], expect="1 [ ] oil the bench vice\n3 [ ] order more biscuits", exit_code=0,
           hint="--open is a flag: action=\"store_true\" makes it True when it's given."),
    custom("Tick one off", tick_off, hint="Mark the task done, and save the list, or the next run won't know."),
    custom("A task that's already done", already_done),
    custom("A task that isn't there", no_such_task,
           hint="If no task has that number, say There's no task 9. on sys.stderr and exit with 1."),
    custom("The very first run", first_run,
           hint="--file names the list. If the file isn't there yet, start with an empty list instead of crashing."),
    custom("Numbers after a gap", next_number, hint="max() of the numbers, plus 1. max(..., default=0) copes with an empty list."),
    output("An empty list", argv=["--file", "empty.json", "list"], files={"empty.json": "[]"}, expect="Nothing on the list.", exit_code=0),
    custom("A file that isn't a list at all", broken_file,
           hint="json.load raises a ValueError for text that isn't JSON. Catch it, say so on sys.stderr, and exit with 1."),
    output("A task number that isn't a number", argv=["done", "two"], expect="", exit_code=2,
           hint="type=int on the number makes argparse refuse two, with exit code 2."),
    output("A command that doesn't exist", argv=["finish", "2"], expect="", exit_code=2,
           hint="add_subparsers gives argparse the commands it knows, and it refuses any other."),
    output("--help works", argv=["--help"], expect="usage:", match="contains", exit_code=0),
]
