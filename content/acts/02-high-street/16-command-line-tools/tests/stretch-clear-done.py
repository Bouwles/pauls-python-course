import json


def cleared(ctx):
    first = ctx.run_program(argv=["clear"])
    if "Cleared 1 done task." not in first.output:
        raise CheckFailed("Paul's list has one done task.", expected="Cleared 1 done task.", actual=first.output.strip())
    second = ctx.run_program(argv=["list"], files=first.files_out)
    want = "1 [ ] oil the bench vice\n3 [ ] order more biscuits"
    if second.output.strip() != want:
        raise CheckFailed("The done task is gone, and the others keep their numbers.", expected=want, actual=second.output.strip())


TWO_DONE = json.dumps([{"number": 1, "task": "a", "done": True}, {"number": 2, "task": "b", "done": True}])

TESTS = [
    custom("Clear the chisels", cleared, visible=True),
    output("Two done", argv=["clear"], files={"todo.json": TWO_DONE}, expect="Cleared 2 done tasks."),
]
