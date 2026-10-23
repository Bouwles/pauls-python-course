---
id: make
type: make
title: Make the address book
on_pass: { mira: "Every name in its place. Even the new ones." }
hints:
  nudge: "For each name: is it a key in `book`? If it is, which value inside changes? If not, what new dictionary goes in?"
  plan:
    - Ask until a blank line
    - Look the name up
    - Add what's missing
    - Change the record inside
    - Report every record
  shape: |
    name = input("Name? ")
    while name != "":
        record = book.___(name)
        if record is None:
            print(f"No address for {name}.")
            address = input("Address? ")
            book[name] = {"address": ___, "parcels": ___}
        else:
            record[___] = record[___] + 1
            print(f"{name}: {record['address']}")
        name = input("Name? ")

    print("Round:")
    for name, record in book.___():
        if ___:
            print(f"{name}, {record['address']}: {record['parcels']}")
---
Build Mira's address book to the spec under **The job**.

```
Name? Bea Hollis
Bea Hollis: The Bakery, Quay Row
Name? Captain Ferro
No address for Captain Ferro.
Address? The Ferry Office, North Quay
Name?
Round:
Bea Hollis, The Bakery, Quay Row: 1
Captain Ferro, The Ferry Office, North Quay: 1
```

The comments are Moss's subgoals from the season tickets.
