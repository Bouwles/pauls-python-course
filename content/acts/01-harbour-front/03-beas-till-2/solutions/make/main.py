# 1. Ask for the text
item = input("Item? ")
qty = input("How many? ")

# 2. Turn the text into a number
qty = int(qty)

# 3. Work out the answer
if item == "bread":
    price = 2.40
else:
    price = 0.85
total = qty * price

# 4. Show it, rounded
print(f"That's {total:.2f}, please.")
