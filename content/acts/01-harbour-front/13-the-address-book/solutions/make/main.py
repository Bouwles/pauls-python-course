# Mira's address book. Every parcel's name gets typed in.
book = {
    "Bea Hollis": {"address": "The Bakery, Quay Row", "parcels": 0},
    "Agnes Rook": {"address": "Harbour Office, North Quay", "parcels": 0},
    "Old Tom": {"address": "The Lighthouse, Point Road", "parcels": 0},
    "Gwen": {"address": "The Drowned Anchor, Quay Row", "parcels": 0},
}

# Ask until a blank line
name = input("Name? ")
while name != "":
    # Look the name up
    record = book.get(name)
    if record is None:
        # Add what's missing
        print(f"No address for {name}.")
        address = input("Address? ")
        book[name] = {"address": address, "parcels": 1}
    else:
        # Change the record inside
        record["parcels"] = record["parcels"] + 1
        print(f"{name}: {record['address']}")
    name = input("Name? ")

# Report every record
print("Round:")
waiting = 0
for name, record in book.items():
    if record["parcels"] > 0:
        print(f"{name}, {record['address']}: {record['parcels']}")
        waiting = waiting + 1
if waiting == 0:
    print("Nothing to deliver.")
