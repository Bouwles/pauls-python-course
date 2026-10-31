phones = {
    "Paul": "01632 960101",
    "Neil": "01632 960245",
    "Caitlin": "01632 960412",
}

name = input("Name? ")
while name != "":
    if phones.get(name, "") == "":
        print(f"No number for {name}.")
    else:
        print(f"{name}: {phones[name]}")
    name = input("Name? ")
