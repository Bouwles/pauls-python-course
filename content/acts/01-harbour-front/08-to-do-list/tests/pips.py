import ast as _ast


def _with_tasks(source, tasks):
    tree = _ast.parse(source)
    for node in tree.body:
        if (
            isinstance(node, _ast.Assign)
            and len(node.targets) == 1
            and isinstance(node.targets[0], _ast.Name)
            and node.targets[0].id == "tasks"
        ):
            node.value = _ast.parse(repr(tasks), mode="eval").body
            return _ast.unparse(tree)
    raise CheckFailed("Keep `tasks = [...]` at the top, so this check can try another day's jobs.")


def another_day(ctx):
    tasks = ["order stamps", "answer Agnes", "mend the scales"]
    r = ctx.run_program(files={ctx.entry: _with_tasks(ctx.source, tasks)})
    expected = "For the noticeboard:\nanswer Agnes\nmend the scales\norder stamps\nFirst job: order stamps"
    if r.error is not None:
        raise CheckFailed(f"With tasks = {tasks!r} it crashed: {type(r.error).__name__}: {r.error}", expected=expected, actual=r.output)
    if norm_lines(r.output) != norm_lines(expected):
        raise CheckFailed(f"With tasks = {tasks!r}, the first job is ordering stamps.", expected=expected, actual=r.output)


TESTS = [
    output("Tuesday's jobs",
           expect="For the noticeboard:\nanswer Agnes\nmend the scales\norder stamps\nsort the post\nFirst job: sort the post",
           visible=True,
           hint="The first job should be whatever Mira put first. Is board really a separate list?"),
    custom("Another day", another_day,
           hint="Work from the list, not the words: whatever is first in tasks is the first job."),
]
