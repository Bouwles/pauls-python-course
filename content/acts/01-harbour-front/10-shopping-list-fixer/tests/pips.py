import ast as _ast


def _with_lists(source, values):
    tree = _ast.parse(source)
    found = set()
    for node in tree.body:
        if (
            isinstance(node, _ast.Assign)
            and len(node.targets) == 1
            and isinstance(node.targets[0], _ast.Name)
            and node.targets[0].id in values
            and node.targets[0].id not in found
        ):
            node.value = _ast.parse(repr(values[node.targets[0].id]), mode="eval").body
            found.add(node.targets[0].id)
    if len(found) < len(values):
        raise CheckFailed("Keep `orders = [...]` at the top, so this check can try another Saturday.")
    return _ast.unparse(tree)


def another_saturday(ctx):
    orders = ["Okonjo", "Vance", "Ashby"]
    r = ctx.run_program(files={ctx.entry: _with_lists(ctx.source, {"orders": orders})})
    expected = "Baking sheet:\nAshby\nOkonjo\nVance\nServe first: Okonjo"
    if r.error is not None:
        raise CheckFailed(f"With orders = {orders!r} it crashed: {type(r.error).__name__}: {r.error}", expected=expected, actual=r.output)
    if norm_lines(r.output) != norm_lines(expected):
        raise CheckFailed(f"With orders = {orders!r}, Mr Okonjo asked first.", expected=expected, actual=r.output)


TESTS = [
    output("Saturday's orders", expect="Baking sheet:\nAshby\nBrannigan\nOkonjo\nVance\nServe first: Vance", visible=True,
           hint="Serve first should be whoever asked first. Is baking_sheet really a separate list?"),
    custom("Another Saturday", another_saturday,
           hint="Work from the list, not the names: whoever is first in orders is served first."),
]
