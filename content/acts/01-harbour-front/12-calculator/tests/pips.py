import ast as _ast


def catches_by_name(tree, source):
    for node in _ast.walk(tree):
        if isinstance(node, _ast.ExceptHandler):
            if node.type is None or (isinstance(node.type, _ast.Name) and node.type.id in ("Exception", "BaseException")):
                return "Catch ValueError by name. Catching everything hides mistakes like Caitlin's typo."


TESTS = [
    output("Two and two", inputs=["2 + 2", "quit"], expect="= 4.00", visible=True,
           hint="If every sum says they aren't both numbers, something else is going wrong and the except is hiding it."),
    output("A word for a number", inputs=["two + 2", "quit"], expect="Those aren't both numbers.", visible=True),
    output("Good, bad, good", inputs=["9 / 3", "nine / 3", "1.5 * 2", "quit"],
           expect="= 3.00\nThose aren't both numbers.\n= 3.00"),
    structure("Catches ValueError by name", check=catches_by_name),
]
