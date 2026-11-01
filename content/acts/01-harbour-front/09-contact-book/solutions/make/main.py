# Riya's contact book. Everyone she draws for, and everyone she buys from.
contacts = {
    "Paul": {"phone": "01632 960101", "address": "The Workshop"},
    "Neil": {"phone": "01632 960245", "address": "The Puzzle Room"},
    "Caitlin": {"phone": "01632 960412", "address": "The Studio"},
    "Print Shop": {"phone": "01632 960530", "address": "Mill Street"},
    "Yahya": {"phone": "01632 960388", "address": "The Archive"},
    "Frame Shop": {"phone": "01632 960617", "address": "Canal Yard"},
}

# Ask until a blank line
name = input("Name? ")
while name != "":
    if name == "add":
        # Add a new contact from one line
        parts = input("New contact? ").split(", ")
        if len(parts) == 3:
            contacts[parts[0]] = {"phone": parts[1], "address": parts[2]}
            print(f"Added {parts[0]}.")
        else:
            print("Name, phone, address, please.")
    else:
        # Look the name up
        record = contacts.get(name)
        if record is not None:
            # Show what's inside the record
            print(f"{name}: {record['phone']}, {record['address']}")
        else:
            print(f"No contact called {name}.")
            # Search the words of every name
            matches = []
            for contact in contacts:
                if name.lower() in contact.lower().split():
                    matches.append(contact)
            # Join what was found
            if len(matches) > 0:
                print("Try: " + ", ".join(matches))
    name = input("Name? ")
