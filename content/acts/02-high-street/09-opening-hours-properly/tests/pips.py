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
    output("Riya's prints", expect="postcards: 4 crates\nposters: 2 crates\nbadges: 3 crates", visible=True,
           hint="After the first time round the loop, what does the name crates point at?"),
    output("Another order", set_vars={"deliveries": {"stickers": 200, "tote bags": 41}},
           expect="stickers: 5 crates\ntote bags: 2 crates"),
    structure("The module keeps its name", check=module_not_shadowed),
]
