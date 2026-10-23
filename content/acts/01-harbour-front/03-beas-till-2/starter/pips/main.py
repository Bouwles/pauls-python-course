item = input("Item? ")
qty = input("How many? ")
if item == "bread":
    total = qty * 2.40
else:
    total = qty * 0.85
print(f"That's {total:.2f}, please.")
