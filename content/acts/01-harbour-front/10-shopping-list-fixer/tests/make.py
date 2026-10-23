import ast as _ast


def _expected(shopping, in_stock):
    order = []
    for item in shopping:
        if item not in order:
            order.append(item)
    for item in in_stock:
        if item in order:
            order.remove(item)
    return "\n".join(["Order form:"] + sorted(order) + ["If the van is small:"] + order[:3])


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
        raise CheckFailed("Keep `shopping = [...]` and `in_stock = [...]` at the top, so the checks can try other lists.")
    return _ast.unparse(tree)


def bea_list(shopping, in_stock):
    def check(ctx):
        r = ctx.run_program(files={ctx.entry: _with_lists(ctx.source, {"shopping": shopping, "in_stock": in_stock})})
        expected = _expected(shopping, in_stock)
        where = f"With shopping = {shopping!r} and in_stock = {in_stock!r}"
        if r.error is not None:
            raise CheckFailed(f"{where}, the program crashed: {type(r.error).__name__}: {r.error}", expected=expected, actual=r.output)
        if norm_lines(r.output) != norm_lines(expected):
            raise CheckFailed(f"{where}, the output is not right.", expected=expected, actual=r.output)
    return check


TESTS = [
    output("Bea's list as it is",
           expect="Order form:\nbutter\neggs\nflour\nraisins\nyeast\nIf the van is small:\nflour\nyeast\nbutter",
           visible=True),
    custom("A shorter week: eggs, butter, eggs, currants, flour; butter in stock",
           bea_list(["eggs", "butter", "eggs", "currants", "flour"], ["butter"]), visible=True),
    custom("Nothing in stock", bea_list(["treacle", "oats", "flour", "oats"], [])),
    custom("The van list stays in Bea's order",
           bea_list(["yeast", "treacle", "sugar", "butter", "almonds"], ["sugar"]),
           hint="If the van list comes out alphabetical, the sort changed Bea's list. Sort a copy."),
    custom("In stock, but not on the list", bea_list(["flour", "eggs", "yeast", "milk"], ["treacle"]),
           hint=".remove() crashes if the item isn't on the list. Check with in before you remove it."),
    custom("Salt written down twice", bea_list(["salt", "flour", "salt", "eggs", "milk"], ["salt"]),
           hint="Salt was on the list twice. Removing it once leaves the other one. Remove the repeats first."),
    custom("Only two things left", bea_list(["yeast", "yeast", "flour", "salt"], ["salt"]),
           hint="With fewer than three items, the van list is just what's there. A slice past the end doesn't crash."),
]
