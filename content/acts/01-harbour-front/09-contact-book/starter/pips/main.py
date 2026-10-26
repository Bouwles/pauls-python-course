phones = {
    "Bea Hollis": "01632 960101",
    "Agnes Rook": "01632 960245",
    "Old Tom": "01632 960412",
}

name = input("Name? ")
while name != "":
    if phones[name] == "":
        print(f"No number for {name}.")
    else:
        print(f"{name}: {phones[name]}")
    name = input("Name? ")
