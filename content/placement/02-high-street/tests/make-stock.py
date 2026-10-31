import ast as _ast
import importlib as _importlib

STALL_ROWS = [
    {"item": "apples", "price": 0.4, "count": 120},
    {"item": "pears", "price": 0.55, "count": 8},
    {"item": "leeks", "price": 0.9, "count": 15},
    {"item": "carrots", "price": 0.3, "count": 4},
    {"item": "beetroot", "price": 0.75, "count": 0},
]

ORCHARD = """item,price,count
quinces,1.50,3
medlars,£2.00,6
figs,0.80,12
cobnuts,0.25,4.5
sloes,0.10,9
"""

PLENTY = """item,price,count
apples,0.40,120
leeks,0.90,15
"""

ROWS = [
    {"item": "swede", "price": 0.6, "count": 10},
    {"item": "chard", "price": 1.1, "count": 2},
    {"item": "onions", "price": 0.2, "count": 9},
    {"item": "garlic", "price": 0.5, "count": 11},
]


def stock_module(ctx, files=None):
    """Import stock.py on its own, without running main.py."""
    extra = {"main.py": "import stock\n"}
    extra.update(files or {})
    ctx.module(files=extra)
    return _importlib.import_module("stock")


def read_case(path, files, rows, bad_lines, message):
    def check(ctx):
        stock = stock_module(ctx, files)
        got = stock.read_stock(path)
        if not isinstance(got, tuple) or len(got) != 2:
            raise CheckFailed("read_stock should give back two things: rows, bad_lines.", actual=repr(got))
        got_rows, got_bad = got
        if got_rows != rows:
            raise CheckFailed(message, expected=repr(rows), actual=repr(got_rows))
        for row in got_rows:
            if type(row["price"]) is not float or type(row["count"]) is not int:
                raise CheckFailed("Each price should be a float and each count an int.", actual=repr(row))
        if list(got_bad) != bad_lines:
            raise CheckFailed("The line numbers of the lines that don't read, counting the header as line 1.",
                              expected=repr(bad_lines), actual=repr(got_bad))
    return check


def stock_call(name, args, expected, message, kwargs=None):
    def check(ctx):
        stock = stock_module(ctx)
        got = getattr(stock, name)(*args, **(kwargs or {}))
        if got != expected or type(got) is not type(expected):
            raise CheckFailed(message, expected=repr(expected), actual=repr(got))
    return check


def comprehensions(tree, source):
    for name in ("to_reorder", "price_book"):
        found = [node for node in _ast.walk(tree) if isinstance(node, _ast.FunctionDef) and node.name == name]
        if not found:
            return f"Define {name} in stock.py."
        kinds = (_ast.ListComp, _ast.DictComp, _ast.SetComp, _ast.GeneratorExp)
        if not any(isinstance(node, kinds) for node in _ast.walk(found[0])):
            return f"{name} should be built with a comprehension."
    return None


def stock_tree(ctx):
    source = ctx.files.get("stock.py", "")
    problem = comprehensions(_ast.parse(source), source)
    if problem:
        raise CheckFailed(problem)


def quiet_import(ctx):
    result = ctx.run_program(files={"main.py": "import stock\n"})
    if result.error is not None:
        raise CheckFailed(f"Importing stock.py crashed: {type(result.error).__name__}: {result.error}")
    if result.output.strip():
        raise CheckFailed("Imported, stock.py should print nothing. Put any trying-out under if __name__ == \"__main__\":.",
                          actual=result.output)


def reorder_file(result):
    return result.files_out.get("reorder.txt", result.files.get("reorder.txt"))


def writes_reorder(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"main.py crashed: {type(result.error).__name__}: {result.error}")
    text = reorder_file(result)
    if text is None:
        raise CheckFailed("main.py should write reorder.txt.")
    if text.splitlines() != ["beetroot", "carrots", "pears"]:
        raise CheckFailed("reorder.txt should hold one item a line, in alphabetical order.",
                          expected="beetroot\ncarrots\npears\n", actual=text)


def fresh_file(ctx):
    result = ctx.run_program(files={"stock.csv": PLENTY, "reorder.txt": "kale\nplums\n"})
    if result.error is not None:
        raise CheckFailed(f"main.py crashed: {type(result.error).__name__}: {result.error}")
    if result.lines() != ["Reorder: nothing"]:
        raise CheckFailed("With plenty of everything and no typos, main.py prints only Reorder: nothing.",
                          expected="Reorder: nothing", actual=result.output)
    text = reorder_file(result)
    if text.strip():
        raise CheckFailed("Last week's reorder.txt said kale and plums. This week's should be empty, written afresh.",
                          expected="", actual=text)


def no_stock_file(ctx):
    saved = ctx.files
    ctx.files = {name: text for name, text in saved.items() if name != "stock.csv"}
    try:
        result = ctx.run_program()
    finally:
        ctx.files = saved
    if result.error is not None:
        raise CheckFailed(f"With no stock.csv, main.py crashed: {type(result.error).__name__}: {result.error}")
    if result.lines() != ["No stock.csv today."]:
        raise CheckFailed("With no stock.csv, main.py should print No stock.csv today. and nothing else.",
                          expected="No stock.csv today.", actual=result.output)


TESTS = [
    output("The stall's list", expect="Skipped lines: 5, 6, 8\nReorder: beetroot, carrots, pears", visible=True),
    custom("read_stock on the stall's list", read_case("stock.csv", None, STALL_ROWS, [5, 6, 8],
                                                    "A dictionary for each line that reads, in the order they came."),
           visible=True),
    custom("read_stock on another file", read_case("orchard.csv", {"orchard.csv": ORCHARD},
                                                   [{"item": "quinces", "price": 1.5, "count": 3},
                                                    {"item": "figs", "price": 0.8, "count": 12},
                                                    {"item": "sloes", "price": 0.1, "count": 9}],
                                                   [3, 5], "Read the file you're given, not always stock.csv."),
           hint="A price with a pound sign won't convert, and neither will a count of 4.5. Both are bad lines."),
    custom("A list with no typos", read_case("plenty.csv", {"plenty.csv": PLENTY},
                                               [{"item": "apples", "price": 0.4, "count": 120},
                                                {"item": "leeks", "price": 0.9, "count": 15}],
                                               [], "Every line reads, so bad_lines is empty.")),
    custom("Reorder below 10", stock_call("to_reorder", (ROWS,), ["chard", "onions"],
                                          "Fewer than 10 left, in alphabetical order.")),
    custom("Exactly 10 left", stock_call("to_reorder", ([{"item": "swede", "price": 0.6, "count": 10}],), [],
                                         "Ten swedes is not fewer than ten."),
           hint="Fewer than below means count < below. Exactly 10 is enough."),
    custom("A different line to reorder at", stock_call("to_reorder", (ROWS,), ["chard", "garlic", "onions", "swede"],
                                                        "With below=12, everything under 12.", kwargs={"below": 12}),
           hint="Use the below you're given; 10 is only the default."),
    custom("Nothing to reorder from", stock_call("to_reorder", ([],), [], "No rows, nothing to order.")),
    custom("The price book", stock_call("price_book", (ROWS,), {"swede": 0.6, "chard": 1.1, "onions": 0.2, "garlic": 0.5},
                                        "Each item and its price.")),
    custom("An empty price book", stock_call("price_book", ([],), {}, "No rows, an empty dictionary.")),
    custom("Built with comprehensions", stock_tree),
    custom("Imported, stock.py says nothing", quiet_import),
    custom("main.py writes reorder.txt", writes_reorder,
           hint="Open reorder.txt with \"w\" and write each item followed by a new line."),
    custom("Last week's reorder.txt is replaced", fresh_file,
           hint="Write reorder.txt every time, even when there's nothing in it. Last week's list would mislead the stall."),
    custom("No stock.csv", no_stock_file,
           hint="Catch the FileNotFoundError that opening a missing file raises."),
    output("The orchard's list", files={"stock.csv": ORCHARD}, expect="Skipped lines: 3, 5\nReorder: quinces, sloes"),
]
