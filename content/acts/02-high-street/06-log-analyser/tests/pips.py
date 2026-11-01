import ast as _ast


def names_the_error(tree, source):
    for node in _ast.walk(tree):
        if isinstance(node, _ast.ExceptHandler):
            if node.type is None or (isinstance(node.type, _ast.Name) and node.type.id in ("Exception", "BaseException")):
                return "Catch ValueError, the error parse_line raises on purpose. Catching everything is what hid the bug."


TESTS = [
    output("Sunday's flight log", expect="12 entries read, 3 skipped", visible=True,
           hint="Catch only ValueError, then run it again and read the traceback. There's a second problem underneath."),
    output("A tidy log", files={"flight.log": "00:00 | INFO | gps | locked\n01:00 | ERROR | gps | signal lost\n"},
           expect="2 entries read, 0 skipped"),
    structure("Catches only ValueError", check=names_the_error),
]
