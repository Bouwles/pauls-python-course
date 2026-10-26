import ast as _ast


def new_codes_each_run(ctx):
    first = ctx.run_program()
    second = ctx.run_program()
    if first.error is not None:
        raise CheckFailed(f"The program crashed: {type(first.error).__name__}: {first.error}")
    if first.output == second.output:
        raise CheckFailed("Two runs gave exactly the same codes. Anyone who saw Monday's codes knows Tuesday's.",
                          expected="different codes each run", actual=first.output)


def four_digits(ctx):
    code = ctx.module().locker_code(4)
    if not isinstance(code, str) or len(code) != 4 or not code.isdigit():
        raise CheckFailed("locker_code(4) should give back four digits.", expected="four digits, like 3071", actual=repr(code))


def no_seed_no_random(tree, source):
    for node in _ast.walk(tree):
        if isinstance(node, _ast.Attribute) and isinstance(node.value, _ast.Name) and node.value.id == "random":
            if node.attr == "seed":
                return "Take out random.seed. A seed makes the codes the same every run."
            return "Pick the digits with secrets.choice, not random. random is for games; secrets is for anything that must not be guessed."


TESTS = [
    output("Three locker codes", expect=r"\ALocker 1: \d{6}\nLocker 2: \d{6}\nLocker 3: \d{6}\n?\Z", match="regex", visible=True),
    custom("New codes every run", new_codes_each_run, visible=True,
           hint="Run it twice and compare. random.seed(2026) puts random back to the same place every run."),
    custom("A four-digit code", four_digits,
           hint="locker_code(4) should give back exactly four digits."),
    structure("Codes come from secrets", check=no_seed_no_random),
]
