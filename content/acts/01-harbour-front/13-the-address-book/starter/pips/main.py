book = {
    "Bea Hollis": "The Bakery, Quay Row",
    "Agnes Rook": "Harbour Office, North Quay",
    "Old Tom": "The Lighthouse, Point Road",
}

name = input("Name? ")
while name != "":
    if book[name] == "":
        print(f"No address for {name}.")
    else:
        print(f"{name}: {book[name]}")
    name = input("Name? ")
