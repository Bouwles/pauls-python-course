---
id: make
type: make
title: Make the password generator
files: [passwords.py]
entry: passwords.py
on_pass: { caitlin.surprised: "Two hundred passwords, and not one O pretending to be a nought. I looked." }
hints:
  nudge: "Which kinds of character does this call want? Build the pool from those, then keep making passwords until one has every kind in it."
  plan:
    - Give each setting a default
    - Say what it does, in a docstring
    - Collect the kinds of character to use
    - Make the pool, leaving out LOOKALIKES if asked
    - Build the password one secrets.choice at a time
    - Try again until it has one of every kind
    - Pick each word with secrets.choice, then join them with sep
    - Gather any number of names with *
    - A new dictionary when none is given
    - Pass the options straight on with **
  shape: |
    def make_password(length=12, digits=True, symbols=False, avoid_lookalikes=True):
        """___"""
        kinds = [string.ascii_lowercase, string.ascii_uppercase]
        if digits:
            kinds.append(___)
        if symbols:
            kinds.append(___)
        pool = ""
        for kind in kinds:
            pool += kind
        if avoid_lookalikes:
            ...  # keep only the characters not in LOOKALIKES
        while True:
            password = ""
            for _ in range(___):
                password += secrets.choice(___)
            ...  # return it if every kind has_any character in it


    def make_passwords(*names, issued=___, **options):
        """___"""
        if issued is None:
            issued = ___
        for name in names:
            issued[name] = make_password(___)
        return issued
---
Write the three functions from the brief in `passwords.py`, each with a docstring. When they work, running the file prints:

```
Passwords for the game server:
  Aaesha: tK7fWq2mRbXe
  Caitlin: Hn3zVp8sCwYd
  Yahya: qD4hTx9jMkPa
Passphrase for the Wi-Fi: ample-crust-vowel-tidal
```

The starter reads the word list into `WORDS` for you, and `has_any(text, chars)` is `True` if `text` has at least one of `chars`. Leave the demo at the bottom as it is.

The comments are the steps from Paul's raffle tickets, plus three new ones for `make_password`. A password might come out with no digit in it at all. So make one, check it, and make another if it falls short: a `while True:` loop with a `return` inside, since `return` ends the loop and the function together. `word.capitalize()` gives a copy with a capital first letter.

The checks make hundreds of passwords with different options and look at every character.
