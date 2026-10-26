import ast as _ast


def module_not_shadowed(tree, source):
    for node in _ast.walk(tree):
        if isinstance(node, _ast.Name) and node.id == "crates" and isinstance(node.ctx, _ast.Store):
            return "Something in main.py is still being named crates, which hides the crates module. Give it a different name."
    uses = [
        node for node in _ast.walk(tree)
        if isinstance(node, _ast.Attribute) and node.attr == "crates_needed"
        and isinstance(node.value, _ast.Name) and node.value.id == "crates"
    ]
    if not uses:
        return "Keep using crates.crates_needed from the module, rather than doing the sum in main.py."


TESTS = [
    output("Sanjay's deliveries", expect="apples: 4 crates\npears: 2 crates\nkale: 3 crates", visible=True,
           hint="After the first time round the loop, what does the name crates point at?"),
    output("Another delivery", set_vars={"deliveries": {"plums": 200, "figs": 41}},
           expect="plums: 5 crates\nfigs: 2 crates"),
    structure("The module keeps its name", check=module_not_shadowed),
]
