---
id: make
type: make
title: Make the password generator
files: [passwords.py]
entry: passwords.py
on_pass: { mira: "Two hundred passwords, and not one O pretending to be a nought. I looked." }
hints:
  nudge: "Which kinds of character does this call want? Build the pool from those, then keep making passwords until one has every kind in it."
  plan:
    - Say what it does, in a docstring
    - Collect the kinds of character to use
    - Make the pool, leaving out LOOKALIKES if asked
    - Build the password one secrets.choice at a time
    - Try again until it has one of every kind
    - Pick each word with secrets.choice, then join them with sep
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
Write the three functions from the brief in `passwords.py`, each with a docstring. The comments are Moss's subgoals from the raffle tickets, with a few new ones.

The starter reads the word list into `WORDS` for you, and `has_any(text, chars)` tells you whether a password has at least one of some characters.

`secrets.choice` might give a password with no digit in it at all. The usual answer, the one Python's own `secrets` documentation uses, is to make a password, check it, and make another if it falls short. A `while True:` loop with a `return` inside does that.

The checks make hundreds of passwords with different options and look at every character.
