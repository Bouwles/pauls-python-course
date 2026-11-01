---
id: make
type: make
title: Make the password checker
on_pass: { aaesha.proud: "Magic-Number-Seven, accepted. Clock0314, two reasons, in order. Requirements met." }
hints:
  nudge: "Each rule is one `if` with its own reason. Which method or operator answers each rule's question? And how will the last line know whether any rule failed?"
  plan:
    - Ask, then tidy what was typed
    - Assume it passes until a rule says otherwise
    - Check each rule on its own, with a reason
    - Give the verdict once, at the end
  shape: |
    username = input("Username? ").___().___()
    password = input("Password? ")
    ok = True
    if len(password) < ___:
        print("Too short: at least 10 characters.")
        ok = False
    if password == password.lower() ___ password == password.upper():
        print("Needs capitals and lower case.")
        ok = False
    if password.___():
        print("Needs a number or a symbol.")
        ok = False
    if username ___ password.lower():
        print("Contains your username.")
        ok = False
    if "password" in password.lower().___("0", "o"):
        print("Contains the word password.")
        ok = False
    if password[___].isdigit():
        print("Ends in a year.")
        ok = False
    if ok:
        print("Password accepted.")
    else:
        print("Password rejected.")
---
Build the checker to Aaesha's six rules. They're at the top of the file. Print every reason that applies, in the order of the rules, then the verdict.

```
Username? paul
Password? Clock0314
Too short: at least 10 characters.
Ends in a year.
Password rejected.
```

Tidy the username, and compare it with the password without caring about capitals. Don't strip the password: a space in a password is its owner's business.

The comments are Paul's labels from the usernames.
