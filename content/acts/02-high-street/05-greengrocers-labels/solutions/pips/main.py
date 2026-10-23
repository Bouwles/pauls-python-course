stock = [("apples", 45, 30), ("pears", 60, 8), ("leeks", 80, 0), ("plums", 25, 12), ("kale", 150, 4)]

reorder = [name for name, price, count in stock if count < 10]
print("Reorder:", ", ".join(reorder))
