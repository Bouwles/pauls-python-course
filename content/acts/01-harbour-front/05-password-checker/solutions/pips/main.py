password = input("Password? ")

has_capital = password != password.lower()
has_lower = password != password.upper()

if not has_capital or not has_lower:
    print("Needs capitals and lower case.")
else:
    print("Letters fine.")
