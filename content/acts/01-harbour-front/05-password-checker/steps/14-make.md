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
Build the checker to Aaesha's six rules, listed at the top of your file. For every rule the password breaks, print its reason, in the order of the rules. Then print the verdict.

```text
Username? paul
Password? Clock0314
Too short: at least 10 characters.
Ends in a year.
Password rejected.
```

Your file also has Paul's four steps from the usernames program, as comments. Tidy the username with `.strip()` and `.lower()`, and look for it in a lower-case copy of the password. Don't strip the password: a space in a password is its owner's business. Give each rule its own `if`, so every reason gets printed.

The checks try passwords that break each rule, several at once, and edge cases like exactly 10 characters, or two digits on the end.
