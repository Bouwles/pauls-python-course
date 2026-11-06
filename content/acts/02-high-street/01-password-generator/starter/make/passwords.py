"""Passwords and passphrases for the Studio's game server."""
import secrets
import string

SYMBOLS = "#$%&*+-=?@"
LOOKALIKES = "Il1O0o"


def load_words(path="wordlist.txt"):
    """Return the words in the word list file as a list, one word per line."""
    # Files come properly in the Word Counter. This one is done for you.
    with open(path) as file:
        return file.read().split()


WORDS = load_words()


def has_any(text, chars):
    """True if text has at least one of the characters in chars."""
    for char in text:
        if char in chars:
            return True
    return False


# make_password(length=12, digits=True, symbols=False, avoid_lookalikes=True)
#   Give each setting a default
#   Say what it does, in a docstring
#   Collect the kinds of character to use
#   Make the pool, leaving out LOOKALIKES if asked
#   Build the password one secrets.choice at a time
#   Try again until it has one of every kind


# make_passphrase(words=4, sep="-", capitalise=False)
#   Give each setting a default
#   Say what it does, in a docstring
#   Pick each word with secrets.choice, then join them with sep


# make_passwords(*names, issued=None, **options)
#   Gather any number of names with *
#   Say what it does, in a docstring
#   A new dictionary when none is given
#   Pass the options straight on with **


# The demo: it runs when you run this file, but not when another program imports it.
if __name__ == "__main__":
    classmates = make_passwords("Aaesha", "Caitlin", "Yahya")
    print("Passwords for the game server:")
    for name, password in classmates.items():
        print(f"  {name}: {password}")
    print("Passphrase for the Wi-Fi:", make_passphrase())
