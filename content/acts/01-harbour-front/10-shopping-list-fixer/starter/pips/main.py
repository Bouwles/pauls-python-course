# Saturday orders, in the order people asked
orders = ["Vance", "Ashby", "Okonjo", "Brannigan"]

baking_sheet = orders
baking_sheet.sort()

print("Baking sheet:")
for name in baking_sheet:
    print(name)
print("Serve first:", orders[0])
