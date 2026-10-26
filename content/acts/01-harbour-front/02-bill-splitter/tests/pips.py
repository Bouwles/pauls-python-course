import ast as _ast


def honest_names(tree, source):
    short = sorted({
        node.id
        for node in _ast.walk(tree)
        if isinstance(node, _ast.Name) and isinstance(node.ctx, _ast.Store) and len(node.id) == 1
    })
    if short:
        return "Rename " + ", ".join(short) + ". Name each one for what it holds."


TESTS = [
    output("Twenty pounds, ten per cent", inputs=["20", "10"], expect="Total with tip: 22.00", visible=True,
           hint="Python does * before +. Brackets make it add 1 and the tip fraction first."),
    output("The bell-ringers' bill", inputs=["41.40", "10"], expect="Total with tip: 45.54", visible=True),
    output("A 12.5 per cent service charge", inputs=["50", "12.5"], expect="Total with tip: 56.25"),
    output("No tip at all", inputs=["8", "0"], expect="Total with tip: 8.00",
           hint="If this is the only one failing, check what happens when the tip is 0."),
    structure("Honest names", check=honest_names),
]
