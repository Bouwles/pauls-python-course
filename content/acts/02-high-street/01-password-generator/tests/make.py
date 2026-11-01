import ast as _ast
import string as _string

LOWER = set(_string.ascii_lowercase)
UPPER = set(_string.ascii_uppercase)
DIGITS = set(_string.digits)
SYMBOLS = set("#$%&*+-=?@")
LOOKALIKES = set("Il1O0o")
DEMO = (
    r"\APasswords for the game server:\n"
    r"  Aaesha: \S{12}\n  Caitlin: \S{12}\n  Yahya: \S{12}\n"
    r"Passphrase for the Wi-Fi: [a-z]+-[a-z]+-[a-z]+-[a-z]+\n?\Z"
)


def words_in(ctx):
    return set(ctx.files.get("wordlist.txt", "").split())


def need(module, name):
    fn = getattr(module, name, None)
    if fn is None:
        raise CheckFailed(f"There is no function called {name}.")
    return fn


def passwords(ctx, count, **options):
    make = need(ctx.module(), "make_password")
    made = [make(**options) for _ in range(count)]
    for p in made:
        if not isinstance(p, str):
            raise CheckFailed("make_password should give back the password as text.", actual=repr(p))
    return made


def check_all(made, length, allowed, required, call):
    for p in made:
        if len(p) != length:
            raise CheckFailed(f"{call} should give {length} characters.", expected=f"{length} characters", actual=repr(p))
        stray = set(p) - allowed
        if stray:
            raise CheckFailed(f"{call} gave a character it shouldn't use: {''.join(sorted(stray))}", actual=repr(p))
        for name, kind in required:
            if not set(p) & kind:
                raise CheckFailed(f"{call} should always have at least one {name}.", actual=repr(p))


def default_password(ctx):
    made = passwords(ctx, 200)
    check_all(made, 12, (LOWER | UPPER | DIGITS) - LOOKALIKES,
              [("lower case letter", LOWER), ("capital", UPPER), ("digit", DIGITS)], "make_password()")


def with_symbols(ctx):
    made = passwords(ctx, 200, length=20, symbols=True)
    check_all(made, 20, (LOWER | UPPER | DIGITS | SYMBOLS) - LOOKALIKES,
              [("lower case letter", LOWER), ("capital", UPPER), ("digit", DIGITS), ("symbol", SYMBOLS)],
              "make_password(20, symbols=True)")


def letters_only(ctx):
    made = passwords(ctx, 200, digits=False)
    check_all(made, 12, (LOWER | UPPER) - LOOKALIKES,
              [("lower case letter", LOWER), ("capital", UPPER)], "make_password(digits=False)")


def lookalikes_allowed(ctx):
    made = passwords(ctx, 300, avoid_lookalikes=False)
    check_all(made, 12, LOWER | UPPER | DIGITS,
              [("lower case letter", LOWER), ("capital", UPPER), ("digit", DIGITS)], "make_password(avoid_lookalikes=False)")
    if not any(set(p) & LOOKALIKES for p in made):
        raise CheckFailed("300 passwords with avoid_lookalikes=False and not one I, l, 1, O, 0 or o. They should be allowed then.")


def short_with_everything(ctx):
    made = passwords(ctx, 60, length=4, symbols=True)
    check_all(made, 4, (LOWER | UPPER | DIGITS | SYMBOLS) - LOOKALIKES,
              [("lower case letter", LOWER), ("capital", UPPER), ("digit", DIGITS), ("symbol", SYMBOLS)],
              "make_password(4, symbols=True)")


def any_order(ctx):
    made = passwords(ctx, 100, symbols=True, length=8, digits=False)
    check_all(made, 8, (LOWER | UPPER | SYMBOLS) - LOOKALIKES,
              [("lower case letter", LOWER), ("capital", UPPER), ("symbol", SYMBOLS)],
              "make_password(symbols=True, length=8, digits=False)")


def all_different(ctx):
    made = passwords(ctx, 100)
    if len(set(made)) < 100:
        raise CheckFailed("100 passwords and some of them were the same. Each one should be picked fresh.")


def passphrase(ctx, call, args, kwargs, count, sep, capitals):
    make = need(ctx.module(), "make_passphrase")
    known = words_in(ctx)
    seen = set()
    for _ in range(40):
        phrase = make(*args, **kwargs)
        if not isinstance(phrase, str):
            raise CheckFailed(f"{call} should give back the passphrase as text.", actual=repr(phrase))
        words = phrase.split(sep) if count > 1 else [phrase]
        if len(words) != count:
            raise CheckFailed(f"{call} should give {count} words joined by {sep!r}.", actual=repr(phrase))
        for word in words:
            if word.lower() not in known:
                raise CheckFailed(f"{call} gave a word that isn't in the word list: {word}", actual=repr(phrase))
            if capitals and word != word.capitalize():
                raise CheckFailed(f"{call} should start each word with a capital.", actual=repr(phrase))
            if not capitals and word != word.lower():
                raise CheckFailed(f"{call} should leave the words in lower case.", actual=repr(phrase))
        seen.add(phrase)
    if len(seen) < 30:
        raise CheckFailed(f"{call} keeps giving the same passphrases. Pick each word with secrets.choice.")


def default_phrase(ctx):
    passphrase(ctx, "make_passphrase()", (), {}, 4, "-", False)


def spaced_phrase(ctx):
    passphrase(ctx, "make_passphrase(6, sep=\" \", capitalise=True)", (6,), {"sep": " ", "capitalise": True}, 6, " ", True)


def one_word(ctx):
    passphrase(ctx, "make_passphrase(words=1)", (), {"words": 1}, 1, "-", False)


def two_classmates(ctx):
    make = need(ctx.module(), "make_passwords")
    issued = make("Aaesha", "Caitlin")
    if not isinstance(issued, dict) or list(issued) != ["Aaesha", "Caitlin"]:
        raise CheckFailed("make_passwords(\"Aaesha\", \"Caitlin\") should give back a dictionary with Aaesha and Caitlin in it.", actual=repr(issued))
    check_all(list(issued.values()), 12, (LOWER | UPPER | DIGITS) - LOOKALIKES,
              [("lower case letter", LOWER), ("capital", UPPER), ("digit", DIGITS)], "make_passwords(\"Aaesha\", \"Caitlin\")")


def options_passed_on(ctx):
    make = need(ctx.module(), "make_passwords")
    issued = make("Yahya", "Riya", length=16, symbols=True)
    if not isinstance(issued, dict) or sorted(issued) != ["Riya", "Yahya"]:
        raise CheckFailed("make_passwords(\"Yahya\", \"Riya\", length=16, symbols=True) should give back a dictionary of both names.", actual=repr(issued))
    check_all(list(issued.values()), 16, (LOWER | UPPER | DIGITS | SYMBOLS) - LOOKALIKES,
              [("symbol", SYMBOLS)], "make_passwords(..., length=16, symbols=True)")


def no_names(ctx):
    make = need(ctx.module(), "make_passwords")
    issued = make()
    if issued != {}:
        raise CheckFailed("make_passwords() with no names should give back an empty dictionary.", expected="{}", actual=repr(issued))


def adds_to_issued(ctx):
    make = need(ctx.module(), "make_passwords")
    issued = {"Neil": "kept-as-it-was"}
    result = make("Paul", issued=issued)
    if result is not issued:
        raise CheckFailed("Given an issued dictionary, make_passwords should add to it and give back that same dictionary.", actual=repr(result))
    if issued.get("Neil") != "kept-as-it-was" or "Paul" not in issued:
        raise CheckFailed("Neil's password should stay as it was, with Paul's added.", actual=repr(issued))


def fresh_each_time(ctx):
    make = need(ctx.module(), "make_passwords")
    make("Aaesha", "Caitlin")
    second = make("Riya")
    if not isinstance(second, dict) or list(second) != ["Riya"]:
        raise CheckFailed("Two calls with no issued dictionary should give two separate dictionaries.",
                          expected="only Riya", actual=repr(second))


def docstrings(tree, source):
    missing = [n.name for n in tree.body if isinstance(n, _ast.FunctionDef) and not _ast.get_docstring(n)]
    if missing:
        return "Give " + ", ".join(missing) + " a docstring: a string in triple quotes on the first line inside the def."


def uses_secrets(tree, source):
    for node in _ast.walk(tree):
        if isinstance(node, _ast.Import) and any(a.name == "random" for a in node.names):
            return "Use secrets, not random. random can be seeded and worked out; secrets can't."
        if isinstance(node, _ast.ImportFrom) and node.module == "random":
            return "Use secrets, not random. random can be seeded and worked out; secrets can't."


TESTS = [
    output("The demo", expect=DEMO, match="regex", visible=True,
           hint="The demo needs all three functions. Each should return its answer, not print it."),
    custom("The default password", default_password, visible=True),
    custom("Twenty characters, with symbols", with_symbols,
           hint="With symbols=True, add SYMBOLS to the pool, and make sure every password has at least one."),
    custom("Letters only", letters_only,
           hint="With digits=False there are no digits at all, and the password still needs both kinds of letter."),
    custom("Lookalikes, when they're allowed", lookalikes_allowed,
           hint="Leave out LOOKALIKES only when avoid_lookalikes is true."),
    custom("Four characters, four kinds", short_with_everything,
           hint="A short password often misses a kind. Make one, check it, and make another until it has one of every kind."),
    custom("Options named in any order", any_order),
    custom("No two the same", all_different,
           hint="Pick every character with secrets.choice, fresh for each password."),
    custom("A four-word passphrase", default_phrase),
    custom("Six words, spaces and capitals", spaced_phrase,
           hint="capitalise=True means each word starts with a capital: word.capitalize()."),
    custom("A passphrase of one word", one_word),
    custom("Passwords for two classmates", two_classmates),
    custom("Options passed straight on", options_passed_on,
           hint="make_passwords passes its **options to make_password, spread out again with **."),
    custom("No names, no passwords", no_names,
           hint="With no names, the loop runs no times and the dictionary stays empty."),
    custom("Adds to an issued dictionary", adds_to_issued,
           hint="When issued is given, add to that dictionary and return it, rather than making a new one."),
    custom("A new dictionary every time", fresh_each_time,
           hint="If only this fails, look at the default for issued. A dictionary in the def line is made once, not on every call."),
    structure("Every function has a docstring", check=docstrings,
              hint="A docstring is a string in triple quotes on the very first line inside the def."),
    structure("Passwords come from secrets", check=uses_secrets),
]
