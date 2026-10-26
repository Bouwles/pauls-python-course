"""Passwords and passphrases for the post office."""
import secrets
import string

SYMBOLS = "#$%&*+-=?@"
LOOKALIKES = "Il1O0o"


def load_words(path="wordlist.txt"):
    """Return the words in the word list file as a list, one word per line."""
    with open(path) as file:
        return file.read().split()


WORDS = load_words()


def has_any(text, chars):
    """True if text has at least one of the characters in chars."""
    for char in text:
        if char in chars:
            return True
    return False


def make_password(length=12, digits=True, symbols=False, avoid_lookalikes=True):
    """Return a password of length characters that nobody can guess.

    Always lower case and capital letters; digits and SYMBOLS if asked for.
    It has at least one character of every kind it uses. With
    avoid_lookalikes, it never uses any of LOOKALIKES.
    """
    kinds = [string.ascii_lowercase, string.ascii_uppercase]
    if digits:
        kinds.append(string.digits)
    if symbols:
        kinds.append(SYMBOLS)

    pool = ""
    for kind in kinds:
        pool += kind
    if avoid_lookalikes:
        kept = ""
        for char in pool:
            if char not in LOOKALIKES:
                kept += char
        pool = kept

    while True:
        password = ""
        for _ in range(length):
            password += secrets.choice(pool)
        if uses_every_kind(password, kinds):
            return password


def uses_every_kind(password, kinds):
    """True if password has at least one character from each string in kinds."""
    for kind in kinds:
        if not has_any(password, kind):
            return False
    return True


def make_passphrase(words=4, sep="-", capitalise=False):
    """Return words picked at random from the word list, joined by sep."""
    picked = []
    for _ in range(words):
        word = secrets.choice(WORDS)
        if capitalise:
            word = word.capitalize()
        picked.append(word)
    return sep.join(picked)


def make_passwords(*names, issued=None, **options):
    """Return a dictionary of each name and a new password made with these options.

    Given an issued dictionary, add to it and return it. Without one,
    start a new dictionary every time.
    """
    if issued is None:
        issued = {}
    for name in names:
        issued[name] = make_password(**options)
    return issued


# The demo: it runs when you run this file, but not when another program imports it.
if __name__ == "__main__":
    clerks = make_passwords("Mira", "Pip", "Sanjay")
    print("Passwords for the counter:")
    for name, password in clerks.items():
        print(f"  {name}: {password}")
    print("Passphrase for the safe:", make_passphrase())
