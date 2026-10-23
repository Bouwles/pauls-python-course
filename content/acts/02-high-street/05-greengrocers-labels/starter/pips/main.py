stock = [("apples", 45, 30), ("pears", 60, 8), ("leeks", 80, 0), ("plums", 25, 12), ("kale", 150, 4)]

reorder = [name if count < 10 for name, price, count in stock]
print("Reorder:", ", ".join(reorder))
