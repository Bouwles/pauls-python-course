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
    output("The Ashbys' order", expect="1060\n10 pounds 60 pence", visible=True,
           hint="Whole pounds come from dividing with //, which drops the remainder."),
    structure("Honest names", check=honest_names),
]
