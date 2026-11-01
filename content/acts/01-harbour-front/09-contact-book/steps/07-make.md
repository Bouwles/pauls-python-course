---
id: make
type: make
title: Make the contact book
on_pass: { riya.pleased.cheer: "It found both shops from one word. No more hunting for the framer's number." }
hints:
  nudge: "Three things can happen to a name: it's `add`, it's in the book, or it isn't. Which do you check first?"
  plan:
    - Ask until a blank line
    - Add a new contact from one line
    - Look the name up
    - Show what's inside the record
    - Search the words of every name
    - Join what was found
  shape: |
    name = input("Name? ")
    while name != "":
        if name == "add":
            parts = input("New contact? ").___(", ")
            if len(parts) == ___:
                contacts[parts[0]] = {"phone": ___, "address": ___}
                print(f"Added {parts[0]}.")
            else:
                print("Name, phone, address, please.")
        else:
            record = contacts.___(name)
            if record is not None:
                print(f"{name}: {record['phone']}, {record['address']}")
            else:
                print(f"No contact called {name}.")
                matches = []
                for contact in contacts:
                    if name.___() in contact.___().___():
                        matches.append(contact)
                if len(matches) > 0:
                    print("Try: " + ___.join(matches))
        name = input("Name? ")
---
Build Riya's contact book to the spec under **The job**.

```
Name? print
No contact called print.
Try: Print Shop
```

The comments in the file are Paul's labels from the parts drawers, plus one for `add`, which splits the line you met two steps ago.

Check for `add` before you look the name up. Nobody in the class is called Add, and Riya would like to keep it that way.
