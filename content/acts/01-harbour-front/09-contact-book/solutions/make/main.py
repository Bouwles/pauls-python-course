# Mira's contact book. Everyone in town with a telephone.
contacts = {
    "Bea Hollis": {"phone": "01632 960101", "address": "The Bakery"},
    "Agnes Rook": {"phone": "01632 960245", "address": "Harbour Office"},
    "Old Tom": {"phone": "01632 960412", "address": "The Lighthouse"},
    "Mr Okonjo": {"phone": "01632 960530", "address": "The Tailor's"},
    "Gwen": {"phone": "01632 960388", "address": "The Drowned Anchor"},
    "Mr Ashby": {"phone": "01632 960617", "address": "Records Office"},
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
