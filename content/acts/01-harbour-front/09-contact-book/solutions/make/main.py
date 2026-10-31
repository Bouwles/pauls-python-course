# Aaesha's contact book. One record for everyone the class needs to reach.
contacts = {
    "Paul": {"phone": "01632 960101", "address": "The Workshop"},
    "Neil": {"phone": "01632 960245", "address": "The Studio"},
    "Caitlin": {"phone": "01632 960412", "address": "The Makerspace"},
    "Clock Repairs": {"phone": "01632 960530", "address": "Mill Street"},
    "Yahya": {"phone": "01632 960388", "address": "The Puzzle Room"},
    "Clock Parts": {"phone": "01632 960617", "address": "Canal Yard"},
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
