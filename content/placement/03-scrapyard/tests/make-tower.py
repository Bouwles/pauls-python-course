import ast as _ast
import copy as _copy

TOWER = [("bell", 1), [("gear", 2), [("anvil", 30)]], ("lamp", 3)]
LOPSIDED = [[("spring", 2)], [[[("valve", 0.5)]], ("hubcap", 4.5)], ("bell", 1), []]


def deep_tower(levels):
    """A tower `levels` crates deep, a bolt at every level and a gold watch at the bottom."""
    crate = [("bolt", 1), ("gold-watch", 2)]
    for _ in range(levels - 1):
        crate = [("bolt", 1), crate]
    return crate


def call(name, crate, *args, expected, message, tol=None):
    def check(ctx):
        module = ctx.module()
        given = _copy.deepcopy(crate)
        got = getattr(module, name)(given, *args)
        if tol is not None and isinstance(got, (int, float)) and abs(got - expected) <= tol:
            pass
        elif got != expected or type(got) is not type(expected) and not (isinstance(got, (int, float)) and isinstance(expected, (int, float))):
            raise CheckFailed(message, expected=repr(expected), actual=repr(got))
        if given != crate:
            raise CheckFailed(f"{name} should leave the tower as it found it.", expected=repr(crate), actual=repr(given))
    return check


def calls_itself(tree, source):
    functions = {node.name: node for node in tree.body if isinstance(node, _ast.FunctionDef)}

    def called(node):
        names = set()
        for inner in _ast.walk(node):
            if isinstance(inner, _ast.Call) and isinstance(inner.func, _ast.Name):
                names.add(inner.func.id)
        return names

    def recursive(name):
        return name in functions and name in called(functions[name])

    for name in ("total_weight", "depth", "path_to"):
        if name not in functions:
            return f"Define a function called {name}."
        if not recursive(name) and not any(recursive(helper) for helper in called(functions[name]) if helper != name):
            return f"{name} should call itself: each crate inside is a smaller tower of the same kind."
    return None


TESTS = [
    function("The tower's weight", call="total_weight", args=(TOWER,), expect=36, visible=True),
    function("The way to the anvil", call="path_to", args=(TOWER, "anvil"), expect=[1, 1, 0], visible=True),
    function("The tower's depth", call="depth", args=(TOWER,), expect=3),
    custom("An empty crate weighs nothing", call("total_weight", [], expected=0, message="No parts, 0 kg.")),
    custom("Empty crates inside empty crates", call("total_weight", [[], [[]]], expected=0, message="Crates with no parts in, 0 kg.")),
    custom("A lopsided tower's weight", call("total_weight", LOPSIDED, expected=8.0, tol=1e-9,
                                             message="2 + 0.5 + 4.5 + 1 kg."),
           hint="Add up the parts in every crate inside, however deep, as well as the parts loose in this one."),
    custom("An empty crate is one deep", call("depth", [], expected=1, message="A crate with nothing in it is 1 deep."),
           hint="Count the crate itself: an empty crate is 1, not 0."),
    custom("A crate of parts is one deep", call("depth", [("bell", 1), ("lamp", 3)], expected=1, message="No crates inside, so 1.")),
    custom("Empty crates still count", call("depth", [[], [[]]], expected=3, message="A crate, holding a crate, holding an empty crate: 3.")),
    custom("A lopsided tower's depth", call("depth", LOPSIDED, expected=4, message="The valve is four crates in."),
           hint="The depth is one more than the deepest crate inside, wherever it is."),
    custom("A part loose in the top crate", call("path_to", TOWER, "lamp", expected=[2], message="The lamp is at position 2 of the outside crate.")),
    custom("Not in the tower", call("path_to", TOWER, "kettle", expected=None, message="No kettle anywhere: None."),
           hint="If nothing in this crate leads to it, give back None."),
    custom("Past a crate that hasn't got it", call("path_to", [[("bell", 1)], ("gear", 2)], "gear", expected=[1],
                                                    message="The first crate has no gear in it; the gear is loose at position 1."),
           hint="When a crate inside gives back None, keep looking at the things after it."),
    custom("The first gear, not the shallowest", call("path_to", [[[("gear", 1)]], ("gear", 2)], "gear", expected=[0, 0, 0],
                                                       message="Searching in order, the gear deep in the first crate comes first.")),
    custom("Nothing in an empty crate", call("path_to", [[], []], "bell", expected=None, message="Empty crates hold no bells.")),
    custom("Two hundred crates deep, weighed", call("total_weight", deep_tower(200), expected=202,
                                                    message="A bolt at each of 200 levels and a 2 kg watch at the bottom.")),
    custom("Two hundred crates deep, measured", call("depth", deep_tower(200), expected=200,
                                                     message="The tower is 200 crates deep.")),
    custom("Two hundred crates deep, found", call("path_to", deep_tower(200), "gold-watch", expected=[1] * 200,
                                                  message="Position 1 at every level, all the way down.")),
    structure("Each function calls itself", check=calls_itself),
]
