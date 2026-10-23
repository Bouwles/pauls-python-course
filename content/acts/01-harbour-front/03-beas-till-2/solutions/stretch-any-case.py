item = input("Item? ").strip().lower()
qty = int(input("How many? "))
if item == "bread":
    price = 2.40
else:
    price = 0.85
print(f"That's {qty * price:.2f}, please.")
