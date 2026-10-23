# Bea's shopping list, most urgent first. Everyone adds to it.
shopping = ["flour", "yeast", "butter", "flour", "sugar", "eggs", "yeast", "raisins", "salt"]
in_stock = ["sugar", "salt"]

# Remove the repeats, keeping the first of each
order = []
for item in shopping:
    if item not in order:
        order.append(item)

# Take out what doesn't apply
for item in in_stock:
    if item in order:
        order.remove(item)

# Sort a copy, not the original
order_form = sorted(order)

# Slice off the part you need
urgent = order[:3]

# Show each list, one item per line
print("Order form:")
for item in order_form:
    print(item)
print("If the van is small:")
for item in urgent:
    print(item)
